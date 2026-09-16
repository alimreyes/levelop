import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ItemEffectsService } from '../inventory/item-effects.service';
import { NotificationsService, NotificationType } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private itemEffectsService: ItemEffectsService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const urgencyMult = { baja: 1, media: 1.5, alta: 2 };
    const importanceMult = { baja: 1, media: 1.5, alta: 2 };

    const xpReward = Math.floor(
      50 * urgencyMult[createTaskDto.urgency] * importanceMult[createTaskDto.importance]
    );
    const goldReward = Math.floor(
      20 * urgencyMult[createTaskDto.urgency] * importanceMult[createTaskDto.importance]
    );

    const task = this.tasksRepository.create({
      title: createTaskDto.title,
      category: createTaskDto.category as any,
      dueDate: new Date(createTaskDto.dueDate),
      urgency: createTaskDto.urgency as any,
      importance: createTaskDto.importance as any,
      xpReward,
      goldReward,
      completed: false,
      assignedTo: createTaskDto.assignedTo,
      collaborators: createTaskDto.collaborators || [],
    });

    return this.tasksRepository.save(task);
  }

  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find({
      order: { dueDate: 'ASC' },
    });
  }

  async findByUser(userId: number): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { assignedTo: userId },
      order: { dueDate: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (updateTaskDto.title) task.title = updateTaskDto.title;
    if (updateTaskDto.category) task.category = updateTaskDto.category as any;
    if (updateTaskDto.dueDate) task.dueDate = new Date(updateTaskDto.dueDate);
    if (updateTaskDto.urgency) task.urgency = updateTaskDto.urgency as any;
    if (updateTaskDto.importance) task.importance = updateTaskDto.importance as any;
    if (updateTaskDto.assignedTo) task.assignedTo = updateTaskDto.assignedTo;
    if (updateTaskDto.collaborators) task.collaborators = updateTaskDto.collaborators;

    return this.tasksRepository.save(task);
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
  }

  async complete(id: number, userId: number): Promise<{ task: Task; rewards: { xp: number; gold: number } }> {
    const task = await this.findOne(id);

    if (task.completed) {
      throw new BadRequestException('Esta tarea ya está completada');
    }

    let finalXP = task.xpReward;
    if (task.importance === 'alta') {
      finalXP = await this.itemEffectsService.calculateXPWithBonus(userId, task.xpReward, task.importance);
    }

    task.completed = true;
    task.category = 'completed' as any;
    await this.tasksRepository.save(task);

    await this.notificationsService.create({
      userId,
      type: NotificationType.TASK_COMPLETED,
      message: `Has completado la tarea: ${task.title}`,
      relatedId: task.id,
    });

    return {
      task,
      rewards: {
        xp: finalXP,
        gold: task.goldReward,
      },
    };
  }

  async completeWithPenalty(
    id: number,
    userId: number,
  ): Promise<{ task: Task; rewards: { xp: number; gold: number }; penalty: any }> {
    const task = await this.findOne(id);

    if (task.completed) {
      throw new BadRequestException('Esta tarea ya está completada');
    }

    const originalPenalty = 50;
    const penaltyResult = await this.itemEffectsService.reducePenalty(userId, originalPenalty);

    let finalXP = task.xpReward;
    if (task.importance === 'alta') {
      finalXP = await this.itemEffectsService.calculateXPWithBonus(userId, task.xpReward, task.importance);
    }

    const finalPenaltyValue = penaltyResult.finalPenalty;

    task.completed = true;
    task.category = 'completed' as any;
    await this.tasksRepository.save(task);

    await this.notificationsService.create({
      userId,
      type: NotificationType.TASK_COMPLETED,
      message: `Has completado la tarea con retraso: ${task.title}. Penalización: ${finalPenaltyValue} XP`,
      relatedId: task.id,
    });

    return {
      task,
      rewards: {
        xp: Math.max(0, finalXP - finalPenaltyValue),
        gold: task.goldReward,
      },
      penalty: penaltyResult,
    };
  }

  async updateCategory(id: number, category: string): Promise<Task> {
    const task = await this.findOne(id);
    task.category = category as any;
    return this.tasksRepository.save(task);
  }

  async addCollaborator(taskId: number, userId: number): Promise<Task> {
    const task = await this.findOne(taskId);

    if (!task.collaborators) {
      task.collaborators = [];
    }

    if (!task.collaborators.includes(userId)) {
      task.collaborators.push(userId);
    }

    return this.tasksRepository.save(task);
  }

  async removeCollaborator(taskId: number, userId: number): Promise<Task> {
    const task = await this.findOne(taskId);

    if (task.collaborators) {
      task.collaborators = task.collaborators.filter(id => id !== userId);
    }

    return this.tasksRepository.save(task);
  }
}
