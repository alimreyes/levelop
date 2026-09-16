# LEVELOP - CASHEA API INTEGRATION SPECIFICATION
## Technical Architecture, Database Schemas, and Transaction Flow (2026 GTM)

---

### SECTION 1: ARCHITECTURAL OVERVIEW & PRINCIPLES

This specification defines the integration architecture between **Levelop's Gamified Work OS** and **Cashea's Buy Now, Pay Later (BNPL) Platform** [23, 367]. The primary objective is to allow Venezuelan corporate employees to redeem virtual currency (**Oro de Levelop**) earned through completed workplace tasks (**Misiones**) directly as financial credits/vouchers inside their **Cashea digital wallets** [368, 376]. These credits are used to liquidate biweekly shopping installments (*cuotas*) at Cashea's 347+ commercial partners [117, 376].

#### Core Architectural Pillars
1. **Offline-First Resilience:** In accordance with Venezuelan infrastructure realities (internet drops, power outages), the mobile and web clients track tasks, capture timestamps, and log earned *Oro* in local storage (IndexedDB / SQLite) [377, 378]. Data synchronization occurs asynchronously when a stable network is established [377].
2. **Double-Spend & Ledger Integrity:** All token minting (earning *Oro*) and burning (redemption requests) are governed by an append-only transaction ledger with strict database constraints and double-entry bookkeeping.
3. **Strict Idempotency:** Cross-platform network calls between Levelop and Cashea must use unique UUID-v4 transaction tokens (`Idempotency-Key`) to prevent duplicate voucher creation under network timeout conditions.
4. **OFAC Sanctions Pre-Screening:** Before registering a Cashea redemption, Levelop runs automated identity checks (KYC/KYB) to verify that the employee is not listed on OFAC's Specially Designated Nationals (SDN) registry, ensuring a fully auditable compliance corridor [328, 374].

---

### SECTION 2: MERMAID SEQUENCE DIAGRAM
This text-based diagram can be rendered directly in Markdown viewers (GitHub, GitLab, Notion, or Mermaid.live) to trace the end-to-end flow.

```mermaid
sequence diagram
    autonumber
    actor Employee as Empleado (App Client)
    participant DB_Local as SQLite (Offline-First Device)
    participant Server as Levelop Backend (Daycohost)
    participant DB as Postgres DB (Master Ledger)
    participant compliance as KYC/OFAC Gateway
    participant Cashea as Cashea Partner API

    Note over Employee, DB_Local: [Offline State] Complete "Misión"
    Employee->>DB_Local: Complete Task (e.g., "Review Code")
    DB_Local->>DB_Local: Append Local Transaction (Mint Oro +XP)
    
    Note over Employee, Server: [Online State] Sync Triggered
    DB_Local->>Server: Sync Local Ledger Data (Asynchronous)
    Server->>DB: INSERT INTO mission_logs & ledger_entries (ON CONFLICT DO NOTHING)
    DB-->>Server: Confirm Database Write (State Locked)
    Server-->>Employee: Sync Acknowledged & UI Updated
    
    Note over Employee, Cashea: [Voucher Redemption Request]
    Employee->>Server: Request Redemption (Redeem X Oro for $V Cashea Voucher)
    Server->>DB: Check Balance & Lock Oro (Status: PENDING)
    DB-->>Server: Balance Verified (Oro debited, Status: RESERVED)
    
    Note over Server, compliance: Real-Time Sanctions Screening
    Server->>compliance: GET /screen?id=employee_national_id
    compliance-->>Server: Sanctions Status: CLEAR / PASS
    
    Note over Server, Cashea: API Voucher Call
    Server->>Cashea: POST /v1/partners/vouchers (Idempotency-Key, Amount, CasheaUserID)
    alt Cashea System Available (Happy Path)
        Cashea->>Cashea: Validate User & Credit Wallet
        Cashea-->>Server: HTTP 201 Created (Voucher ID, Status: ACTIVE)
        Server->>DB: UPDATE ledger_entries SET status = 'SUCCESS', voucher_id = V_ID
        DB-->>Server: Ledger Finalized
        Server-->>Employee: Display Success (Voucher Applied to Cashea Balance)
    else Cashea Timeout or HTTP 5xx Error
        Server->>Server: Trigger Circuit Breaker / Retries
        Server->>DB: ROLLBACK Transaction (Release Locked Oro)
        DB-->>Server: Balance Restored
        Server-->>Employee: Display Friendly Error (Try Again Later, Oro Restored)
    end
    
    Note over Cashea, Server: [Webhook Confirmation on Installment Payment]
    Cashea->>Server: POST /webhooks/cashea/status (Voucher Applied to Installment)
    Server->>DB: UPDATE ledger_entries SET spent_at = TIMESTAMP
    Server-->>Cashea: HTTP 200 OK
```

---

### SECTION 3: DATABASE SCHEMA SPECIFICATIONS

Levelop manages user balances and Cashea sync statuses utilizing three core PostgreSQL relational tables:

```sql
-- 1. Employee Account Mapping
CREATE TABLE employee_cashea_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    national_id_type VARCHAR(10) NOT NULL, -- 'V' or 'E' (Venezuelan ID types)
    national_id VARCHAR(20) NOT NULL UNIQUE, -- For OFAC & Cashea validation
    cashea_user_id VARCHAR(100) UNIQUE, -- Filled after first OAuth/handshake
    is_ofac_cleared BOOLEAN DEFAULT FALSE,
    last_ofac_check_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cashea_profiles_national_id ON employee_cashea_profiles(national_id);

-- 2. Double-Entry Bookkeeping Ledger
CREATE TABLE oro_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    transaction_type VARCHAR(20) NOT NULL, -- 'EARN' (Misión completed), 'BURN' (Redeemed)
    amount INT NOT NULL, -- Always positive. 'BURN' debit is calculated logically
    currency_code VARCHAR(10) DEFAULT 'ORO',
    idempotency_key UUID UNIQUE NOT NULL, -- To prevent duplication from offline client syncs
    reference_id UUID, -- References mission_logs.id OR redemption_requests.id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Redemption Request Tracking
CREATE TABLE cashea_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    oro_debited INT NOT NULL,
    usd_equivalent NUMERIC(10, 2) NOT NULL, -- Exchange rate of Oro to USD set by corporate HR
    redemption_status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, SUCCESS, FAILED
    cashea_voucher_id VARCHAR(100) UNIQUE, -- Returned from Cashea API
    idempotency_key UUID UNIQUE NOT NULL, -- Sent to Cashea API header
    error_log TEXT,
    spent_at TIMESTAMP WITH TIME ZONE, -- Webhook timestamp when applied to an installment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cashea_redemptions_status ON cashea_redemptions(redemption_status);
```

---

### SECTION 4: API INTEGRATION CONTRACTS

#### 1. Outbound Request: Create Cashea Voucher
*Executed by Levelop Backend towards Cashea partner Gateway.*

* **Method:** `POST`
* **Path:** `https://api.cashea.app/v1/partners/vouchers`
* **Headers:**
  ```http
  Authorization: Bearer <Levelop_B2B_JWT_Token>
  Content-Type: application/json
  Idempotency-Key: c9d8544c-2041-477c-bc20-db7e89a0b3ec
  ```
* **Payload Format:**
  ```json
  {
    "partner_redemption_id": "8f87b4c2-a80a-4b74-87b2-541baed257d4",
    "cashea_user": {
      "national_id_type": "V",
      "national_id": "21456987"
    },
    "amount": {
      "value": 15.00,
      "currency": "USD"
    },
    "metadata": {
      "corporate_sponsor_rif": "J-501934070",
      "benefit_type": "Extrarrecompensa",
      "levelop_user_id": "3055921a-5568-4bfe-9f6d-0c566a560724"
    }
  }
  ```

#### 2. Outbound Response: Successful Voucher Generation
* **Status:** `201 Created`
* **Payload:**
  ```json
  {
    "cashea_voucher_id": "VCH-2026-9988223",
    "partner_redemption_id": "8f87b4c2-a80a-4b74-87b2-541baed257d4",
    "status": "ACTIVE",
    "created_at": "2026-08-06T11:41:00Z",
    "expiration_date": "2026-11-06T23:59:59Z",
    "amount": {
      "value": 15.00,
      "currency": "USD"
    }
  }
  ```

#### 3. Inbound Hook: Installment Liquidation Notification
*Triggered by Cashea to inform Levelop when the employee has successfully applied the voucher towards their biweekly cuota.*

* **Method:** `POST`
* **Path:** `https://api.levelop.com/v1/webhooks/cashea/status`
* **Headers:**
  ```http
  X-Cashea-Signature: t=1786045260,v1=9e821fdc098dfc38ae2b8a09f8723c0b
  ```
* **Payload Format:**
  ```json
  {
    "event": "voucher.applied",
    "timestamp": "2026-08-06T11:42:00-07:00",
    "data": {
      "cashea_voucher_id": "VCH-2026-9988223",
      "partner_redemption_id": "8f87b4c2-a80a-4b74-87b2-541baed257d4",
      "amount_applied": {
        "value": 15.00,
        "currency": "USD"
      },
      "installment_id": "CUO-8239102",
      "retailer_name": "Farmatodo"
    }
  }
  ```

---

### SECTION 5: EXCEPTION HANDLING & SECURITY MATRIX

| Failure Scenario | Threat Vector | Technical Mitigation Strategy |
| :--- | :--- | :--- |
| **Cashea Gateway Downtime** | HTTP 503 / Connection Timeout | Apply **Resilience4j Circuit Breaker**. If API fails after 3 retries, transition transaction status to `FAILED`, log error to `cashea_redemptions.error_log`, and trigger Postgres database rollback to restore the debited *Oro* to the user's ledger within `100ms` [381]. |
| **User ID Mismatch** | HTTP 404 User Not Found | If the employee enters a Venezuelan ID (`cédula`) that is not registered or active on Cashea, immediately return `404`, flag the status as `FAILED`, and cancel the ledger burn [351, 381]. Prompt employee to register in Cashea first. |
| **OFAC Alert Trigger** | Potential Compliance Breach | If the automated screening service detects the ID on the OFAC SDN list, block the transaction before making the outbound Cashea call [17, 374]. Lock the employee's profile, flag as `BLOCKED_SANCTIONS`, and trigger an internal HR compliance alert. |
| **Local Device Clock Desync** | Replay Attacks / Token Fraud | Local IndexedDB uses server-delivered cryptographic hashes (`session_salt`) and UUID validation for offline tasks. During synchronization, the Backend calculates mission verification utilizing Server NTP time, ignoring the device’s local clock to prevent token duplication [377]. |
| **Webhook Signature Mismatch** | Spoofed payment notifications | Levelop validates the `X-Cashea-Signature` header using HMAC-SHA256, hashing the timestamp concatenated with the raw request body using Levelop's shared webhook secret. Webhooks failing validation are immediately dropped with a `401 Unauthorized` response. |
