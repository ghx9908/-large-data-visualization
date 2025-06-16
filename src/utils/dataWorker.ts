import { WorkerManager } from "../components/WorkerManager";
import { DataPoint, WorkerMessage } from "../types";

/**
 * 数据处理Worker的代码
 */
const workerCode = `
self.onmessage = function(e) {
  const { data, startIndex, endIndex, maxPoints } = e.data;
  
  // 在Worker中执行数据聚合
  const result = aggregateData(data, startIndex, endIndex, maxPoints);
  
  self.postMessage(result);
  
  function aggregateData(data, startIndex, endIndex, maxPoints) {
    if (endIndex - startIndex <= maxPoints) {
      return data.slice(startIndex, endIndex);
    }
    
    const step = Math.floor((endIndex - startIndex) / maxPoints);
    const result = [];
    
    for (let i = startIndex; i < endIndex; i += step) {
      // 聚合一个步长内的所有值
      let sum = 0;
      let count = 0;
      let minValue = Infinity;
      let maxValue = -Infinity;
      let minTime = data[i][0];
      
      for (let j = 0; j < step && i + j < endIndex; j++) {
        const value = data[i + j][1];
        sum += value;
        count++;
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
      
      // 存储均值
      result.push([minTime, Math.round(sum / count)]);
    }
    
    return result;
  }
};
`;

/**
 * 创建和管理数据处理Worker
 */
export class DataWorkerManager {
  private workerManager: WorkerManager;

  constructor() {
    this.workerManager = new WorkerManager(workerCode);
  }

  /**
   * 处理数据并返回处理结果
   * @param data 原始数据
   * @param startIndex 开始索引
   * @param endIndex 结束索引
   * @param maxPoints 最大点数
   * @returns 处理后的数据
   */
  public processData(
    data: DataPoint[],
    startIndex: number,
    endIndex: number,
    maxPoints: number
  ): Promise<DataPoint[]> {
    const message: WorkerMessage = {
      data,
      startIndex,
      endIndex,
      maxPoints
    };

    return this.workerManager.postMessage(message);
  }

  /**
   * 终止Worker
   */
  public terminate(): void {
    this.workerManager.terminateWorker();
  }
} 
