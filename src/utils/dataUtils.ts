import { DataPoint, AggregationOptions, WorkerMessage } from '../types';

/**
 * 生成大量数据点（10万+）
 * @param {number} count 数据点数量
 * @returns {DataPoint[]} 数据点数组
 */
export function generateLargeDataset(count: number = 100000): DataPoint[] {
  const data: DataPoint[] = [];
  const now = new Date();
  const oneDay = 24 * 3600 * 1000;

  for (let i = 0; i < count; i++) {
    const time = new Date(now.getTime() - ((count - i) * oneDay) / 20);
    data.push([
      time.getTime(),
      Math.round((Math.random() - 0.5) * 1000 + Math.sin(i / 5000) * 500 + 5000)
    ]);
  }

  return data;
}

/**
 * 根据视图范围对数据进行聚合和采样
 * @param {DataPoint[]} data 原始数据
 * @param {number} startIndex 开始索引
 * @param {number} endIndex 结束索引
 * @param {number} maxPoints 最大点数
 * @returns {DataPoint[]} 处理后的数据
 */
export function aggregateData(
  data: DataPoint[],
  startIndex: number,
  endIndex: number,
  maxPoints: number = 1000
): DataPoint[] {
  // 如果数据量小于最大点数，直接返回
  if (endIndex - startIndex <= maxPoints) {
    return data.slice(startIndex, endIndex);
  }

  // 计算采样步长
  const step = Math.floor((endIndex - startIndex) / maxPoints);

  // 采样数据
  const result: DataPoint[] = [];
  for (let i = startIndex; i < endIndex; i += step) {
    // 聚合一个步长内的数据，取平均值
    let sum = 0;
    let count = 0;
    let minTime = data[i][0];

    for (let j = 0; j < step && i + j < endIndex; j++) {
      sum += data[i + j][1];
      count++;
    }

    result.push([minTime, Math.round(sum / count)]);
  }

  return result;
}

/**
 * 创建Web Worker以处理密集型计算
 * @returns {Worker} Web Worker实例
 */
export function createDataWorker(): Worker {
  // 构建Worker代码，包含聚合函数
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
          let sum = 0;
          let count = 0;
          let minTime = data[i][0];
          
          for (let j = 0; j < step && i + j < endIndex; j++) {
            sum += data[i + j][1];
            count++;
          }
          
          result.push([minTime, Math.round(sum / count)]);
        }
        
        return result;
      }
    };
  `;

  const blob = new Blob([workerCode], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
}

/**
 * 高级数据聚合 - 添加多种聚合策略
 * @param {DataPoint[]} data 原始数据
 * @param {AggregationOptions} options 聚合选项
 * @returns {DataPoint[]} 处理后的数据
 */
export function advancedAggregation(data: DataPoint[], options: AggregationOptions): DataPoint[] {
  const { startIndex, endIndex, maxPoints } = options;

  // 如果数据量小于最大点数，直接返回
  if (endIndex - startIndex <= maxPoints) {
    return data.slice(startIndex, endIndex);
  }

  // 计算采样步长
  const step = Math.floor((endIndex - startIndex) / maxPoints);
  const result: DataPoint[] = [];

  for (let i = startIndex; i < endIndex; i += step) {
    // 收集这个步长内的所有值
    const segmentValues: number[] = [];
    let minTime = data[i][0];

    for (let j = 0; j < step && i + j < endIndex; j++) {
      segmentValues.push(data[i + j][1]);
    }

    // 计算聚合值：均值、最大值、最小值
    const avgValue = Math.round(segmentValues.reduce((sum, val) => sum + val, 0) / segmentValues.length);
    const maxValue = Math.max(...segmentValues);
    const minValue = Math.min(...segmentValues);

    // 这里只使用平均值，但可以根据需要使用最大值、最小值或其他策略
    result.push([minTime, avgValue]);
  }

  return result;
} 
