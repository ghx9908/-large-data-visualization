import { DataPoint, WorkerMessage } from '../types';

/**
 * Web Worker管理器 - 优化Web Worker的创建、通信和销毁
 */
export class WorkerManager {
  private worker: Worker | null = null;
  private isProcessing: boolean = false;
  private callbackQueue: Array<{ resolve: Function, reject: Function }> = [];

  /**
   * 构造函数
   * @param workerCode Worker代码或URL
   */
  constructor(private workerCode: string) {
    this.initWorker();
  }

  /**
   * 初始化Worker
   */
  private initWorker(): void {
    try {
      const blob = new Blob([this.workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));

      // 设置消息处理器
      this.worker.onmessage = this.handleMessage.bind(this);
      this.worker.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('Worker初始化失败:', error);
    }
  }

  /**
   * 处理Worker返回的消息
   */
  private handleMessage(e: MessageEvent): void {
    this.isProcessing = false;
    const callback = this.callbackQueue.shift();

    if (callback) {
      callback.resolve(e.data);
    }
  }

  /**
   * 处理Worker错误
   */
  private handleError(e: ErrorEvent): void {
    this.isProcessing = false;
    const callback = this.callbackQueue.shift();

    if (callback) {
      callback.reject(new Error(`Worker错误: ${e.message}`));
    }

    // 尝试重新初始化Worker
    this.terminateWorker();
    this.initWorker();
  }

  /**
   * 发送消息到Worker并返回Promise
   * @param message 发送的消息
   * @returns 处理结果的Promise
   */
  public postMessage(message: WorkerMessage): Promise<DataPoint[]> {
    return new Promise((resolve, reject) => {
      // 添加回调到队列
      this.callbackQueue.push({ resolve, reject });

      // 如果当前正在处理，延迟处理
      if (this.isProcessing) {
        setTimeout(() => {
          this.postMessage(message).then(resolve).catch(reject);
        }, 50);
        return;
      }

      // 发送消息到Worker
      if (this.worker) {
        this.isProcessing = true;
        this.worker.postMessage(message);
      } else {
        reject(new Error('Worker未初始化'));
        this.callbackQueue.pop(); // 移除刚添加的回调
      }
    });
  }

  /**
   * 终止Worker
   */
  public terminateWorker(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    // 拒绝所有排队的请求
    while (this.callbackQueue.length > 0) {
      const callback = this.callbackQueue.shift();
      if (callback) {
        callback.reject(new Error('Worker已终止'));
      }
    }
  }

  /**
   * 检查Worker是否可用
   */
  public isWorkerAvailable(): boolean {
    return this.worker !== null;
  }
} 
