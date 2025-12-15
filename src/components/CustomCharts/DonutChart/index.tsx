import Chart from "@/components/Base/Chart";
import { ChartData, ChartOptions } from "chart.js/auto";
import { Colors, getColor } from "@/utils/colors";
import { selectColorScheme } from "@/stores/colorSchemeSlice";
import { selectDarkMode } from "@/stores/darkModeSlice";
import { useAppSelector } from "@/stores/hooks";
import { useMemo } from "react";
export interface CustomChartProps{
  label: string;
  value: number;
  color?: DotNestedKeys<Colors>;
}
interface MainProps extends React.ComponentPropsWithoutRef<"canvas"> {
  width?: number | "auto";
  height?: number | "auto";
  options?: CustomChartProps[];
  showLegend?: boolean;
}

export const DonutChart = ({ width = "auto", height = "auto", className = "", options = [], showLegend = true }: MainProps) => {
  const props = {
    width: width,
    height: height,
    className: className,
    options: options
  };
  const colorScheme = useAppSelector(selectColorScheme);
  const darkMode = useAppSelector(selectDarkMode);

  const chartData = options.map((option) => option.value);
  const chartColors = options.map((option) => getColor(option.color || "pending", 0.9));
  const data: ChartData = useMemo(() => {
    return {
      labels: options.map((option) => option.label),
      datasets: [
        {
          data: chartData,
          backgroundColor: colorScheme ? chartColors : "",
          hoverBackgroundColor: colorScheme ? chartColors : "",
          borderWidth: 5,
          borderColor: darkMode ? getColor("darkmode.700") : getColor("white"),
        },
      ],
    };
  }, [colorScheme, darkMode]);

  const chartOptions: ChartOptions = useMemo(() => {
    return {
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: false,
          text: "Donut Chart",
        },
        legend: {
          display: showLegend,
          position: "bottom"
        },
      },
      cutout: "70%",
    };
  }, [colorScheme, darkMode]);

  return (
    <Chart
      type="doughnut"
      width={props.width}
      height={props.height}
      data={data}
      options={chartOptions}
      className={props.className}
    />
  );
}
;
