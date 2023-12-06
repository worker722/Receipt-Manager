import _ from "@lodash";
import clsx from "clsx";
import { RECEIPT_STATUS } from "./store/receiptSlice";

export const statuses = [
  {
    id: 1,
    value: RECEIPT_STATUS.IN_PROGRESS,
    name: "In Progress",
    color: "bg-blue text-white",
  },
  {
    id: 2,
    value: RECEIPT_STATUS.PENDING,
    name: "Pending",
    color: "bg-purple text-white",
  },
  {
    id: 3,
    value: RECEIPT_STATUS.APPROVED,
    name: "Approved",
    color: "bg-green-800 text-white",
  },
  {
    id: 4,
    value: RECEIPT_STATUS.REFUNDED,
    name: "Refunded",
    color: "bg-red text-white",
  },
  {
    id: 5,
    value: RECEIPT_STATUS.CLOSED,
    name: "Closed",
    color: "bg-grey text-white",
  },
];

function ReceiptStatus(props) {
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

export default ReceiptStatus;
