export interface TodoType {
  id: number;
  complete: boolean;
  title: string;
}

// enum import가 안 됨...
// export enum TodoListFilterEnum {
//   ALL = "ALL",
//   COMPLETE = "COMPLETE",
//   INCOMPLETE = "INCOMPLETE"
// }
