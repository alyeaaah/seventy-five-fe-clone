import { Table } from "antd";

const columns = [
  {
    title: "Round",
    dataIndex: "round",
    key: "round",
    align: "center" as const,
    padding: 0,
    margin: 0,
    render: (text: string) => <div className="text-left">Round {text}</div>,
  },
  {
    title: "Teams Needed",
    dataIndex: "teams",
    key: "teams",
    align: "right" as const,
    padding: 0,
    margin: 0,
    render: (text: string) => <div className="text-right">{text} Teams</div>,
  },
  {
    title: "Matches",
    dataIndex: "matches",
    key: "matches",
    align: "right" as const,
    padding: 0,
    margin: 0,
    render: (text: string) => <div className="text-right">{text} {parseInt(text) === 1 ? "Match" : "Matches"}</div>,

  },
];

const dataSource = Array.from({ length: 10 }, (_, i) => {
  const round = i + 1;
  const teams = Math.pow(2, round);

  return {
    key: round,
    round,
    teams,
    matches: teams / 2,
  };
});

export default function RoundTable() {
  return (
    <Table
      columns={columns}
      size="small"
      dataSource={dataSource}
      pagination={false}
      rootClassName="p-0 m-0"
    />
  );
}
