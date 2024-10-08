import _ from "@lodash";
import clsx from "clsx";
import { REPORT_STATUS } from "./store/reportSlice";

export const statuses = [
  {
    id: 1,
    value: REPORT_STATUS.IN_PROGRESS,
    name: "In Progress",
    color: "bg-blue text-white",
  },
  {
    id: 2,
    value: REPORT_STATUS.IN_REVIEW,
    name: "In Review",
    color: "bg-purple text-white",
  },
  {
    id: 3,
    value: REPORT_STATUS.APPROVED,
    name: "Approved",
    color: "bg-green-800 text-white",
  },
  {
    id: 4,
    value: REPORT_STATUS.REJECTED,
    name: "Rejected",
    color: "bg-red text-white",
  },
  {
    id: 5,
    value: REPORT_STATUS.CLOSED,
    name: "Closed",
    color: "bg-grey text-white",
  },
];

function ReportStatus(props) {
  const status = _.find(statuses, { value: props.value });
  return (
    <>
      {status ? (
        <div
          className={clsx(
            "inline text-12 font-semibold py-4 px-12 rounded-full truncate",
            status.color
          )}
        >
          {status.name}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default ReportStatus;
