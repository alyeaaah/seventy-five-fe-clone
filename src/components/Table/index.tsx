import React from "react";
import { Table, TableProps } from "antd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DraggableRow, moveRow } from "./Draggable";

// Extend Ant's TableProps to include custom props
interface CustomTableProps<T = any> extends TableProps<T> {
  onRowReorder?: (newData: T[]) => void;
}

export const CustomTable = <T extends object = any>({
  dataSource,
  columns,
  rowKey = "rowKey",
  onRowReorder,
  ...restProps // Captures all other Ant Table props
}: CustomTableProps<T>) => {

  return (
    <DndProvider backend={HTML5Backend} key={"provider_"+JSON.stringify(dataSource)}>
      <Table<T>
        dataSource={dataSource}
        columns={columns}
        {...restProps} // Spread all Ant Table props
        components={{
          ...restProps.components, // Preserve existing components
          body: {
            ...restProps.components?.body,
            row: (prop:any) => {
              return (
                <DraggableRow
                  {...prop}
                  index={dataSource?.findIndex((item) => JSON.stringify(item) == JSON.stringify(prop["children"][0]?.props?.record)) || 0}
                  data={dataSource}
                  moveRow={(dragIndex: any, hoverIndex: any) => {
                    moveRow(dragIndex, hoverIndex, dataSource as T[], (newData: T[]) => onRowReorder?.(newData));
                  }}
                />
              );
            },
          },
        }}
        rowKey={(record: any) => `${(record["player_uuid"] || record["id"] || record["uuid"] || JSON.stringify(record).slice(0, 48) || 0)}__${rowKey.toString()}`}
      />
    </DndProvider>
  );
};