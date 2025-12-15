import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";


const DraggableRow = ({ index, moveRow, className, style, data, ...restProps }: any) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: 'row',
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    drop: (item: { index: any }) => {
      if (item.index != index) {
        moveRow(item.index, index);
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'row',
    item: { index },
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      }
    },
  });

  drop(drag(ref));

  return (
    <tr
      key={index}
      ref={ref}
      className={`${className} ${isOver ? 'drop-over' : ''} =${index}`}
      style={{ ...style, opacity: isDragging ? 0.5 : 1 }}
      {...restProps}
    />
  );
};

const moveRow = (dragIndex: any, hoverIndex: any, data: any[], setData: (data: any[]) => void) => {
  const dragRow = data[dragIndex];
  const newData = [...data];
  newData.splice(dragIndex, 1);
  newData.splice(hoverIndex, 0, dragRow);
  setData(newData);
};
export { DraggableRow, moveRow };