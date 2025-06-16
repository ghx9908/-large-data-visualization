// 数据点类型定义
export type DataPoint = [number, number]; // [timestamp, value]

// 聚合选项接口
export interface AggregationOptions {
  startIndex: number;
  endIndex: number;
  maxPoints: number;
}

// Worker消息接口
export interface WorkerMessage {
  data: DataPoint[];
  startIndex: number;
  endIndex: number;
  maxPoints: number;
}

// 缩放范围接口
export interface ViewportRange {
  start: number;
  end: number;
} 
