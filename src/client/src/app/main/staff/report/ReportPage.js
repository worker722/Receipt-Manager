import FuseLoading from "@fuse/core/FuseLoading";
import FusePageSimple from "@fuse/core/FusePageSimple";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import withRouter from "@fuse/core/withRouter";
import FuseUtils from "@fuse/utils/FuseUtils";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import MessageIcon from "@mui/icons-material/Message";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Button } from "@mui/material";
import Paper from "@mui/material/Paper";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { darken, lighten, styled } from "@mui/material/styles";
import { useTheme } from "@mui/styles";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { showMessage } from "app/store/fuse/messageSlice";
import withReducer from "app/store/withReducer";
import { motion } from "framer-motion";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import ReceiptStatus from "./ReceiptStatus";
import ReportStatus from "./ReportStatus";
import reducer from "./store";
import {
  RECEIPT_STATUS,
  approveReceipt,
  refundReceipt,
} from "./store/receiptSlice";
import {
  REPORT_STATUS,
  approveReport,
  closeReport,
  exportReport,
  getReport,
} from "./store/reportSlice";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-toolbar": {},
  "& .FusePageSimple-content": {},
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

const getBackgroundColor = (color, mode) =>
  mode === "dark" ? darken(color, 0.6) : lighten(color, 0.6);

const getHoverBackgroundColor = (color, mode) =>
  mode === "dark" ? darken(color, 0.5) : lighten(color, 0.5);

const getSelectedBackgroundColor = (color, mode) =>
  mode === "dark" ? darken(color, 0.4) : lighten(color, 0.4);

const getSelectedHoverBackgroundColor = (color, mode) =>
  mode === "dark" ? darken(color, 0.3) : lighten(color, 0.3);

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .super-app-theme--Matched": {
    backgroundColor: getBackgroundColor(
      theme.palette.success.light,
      theme.palette.mode
    ),
    "&:hover": {
      backgroundColor: getHoverBackgroundColor(
        theme.palette.success.light,
        theme.palette.mode
      ),
    },
    "&.Mui-selected": {
      backgroundColor: getSelectedBackgroundColor(
        theme.palette.success.light,
        theme.palette.mode
      ),
      "&:hover": {
        backgroundColor: getSelectedHoverBackgroundColor(
          theme.palette.success.light,
          theme.palette.mode
        ),
      },
    },
  },
  "& .super-app-theme--UnMatched": {
    backgroundColor: getBackgroundColor(
      theme.palette.warning.light,
      theme.palette.mode
    ),
    "&:hover": {
      backgroundColor: getHoverBackgroundColor(
        theme.palette.warning.light,
        theme.palette.mode
      ),
    },
    "&.Mui-selected": {
      backgroundColor: getSelectedBackgroundColor(
        theme.palette.warning.light,
        theme.palette.mode
      ),
      "&:hover": {
        backgroundColor: getSelectedHoverBackgroundColor(
          theme.palette.warning.light,
          theme.palette.mode
        ),
      },
    },
  },
  "& .super-app-theme--Personal": {
    backgroundColor: getBackgroundColor(
      theme.palette.info.light,
      theme.palette.mode
    ),
    "&:hover": {
      backgroundColor: getHoverBackgroundColor(
        theme.palette.info.light,
        theme.palette.mode
      ),
    },
    "&.Mui-selected": {
      backgroundColor: getSelectedBackgroundColor(
        theme.palette.info.light,
        theme.palette.mode
      ),
      "&:hover": {
        backgroundColor: getSelectedHoverBackgroundColor(
          theme.palette.info.light,
          theme.palette.mode
        ),
      },
    },
  },
}));

const ApproveTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.success.main,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.success.main,
  },
}));

const RefundTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.error.main,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.error.main,
  },
}));

const ReportPage = (props) => {
  const { t } = useTranslation("ReportsPage");

  const routeParams = useParams();
  const publicId = routeParams.reportId;

  const [loading, setLoading] = useState(false);
  const [rowExpenses, setRowExpenses] = useState([]);
  const [rowReceipts, setRowReceipts] = useState([]);
  const [report, setReport] = useState({});
  const [reportStatus, setReportStatus] = useState(false);
  const [allResolved, setAllResolved] = useState(false);
  const [totalWithoutReceipt, setTotalWithoutReceipt] = useState(0);
  const [totalPersonal, setTotalPersonal] = useState(0);
  const [totalVatExpense, setTotalVatExpense] = useState(0);
  const [totalVatPersonal, setTotalVatPersonal] = useState(0);
  const [totalVat, setTotalVat] = useState(0);
  const [totalExpenseWithReceipt, setTotalExpenseWithReceipt] = useState(0);

  const theme = useTheme();

  const dispatch = useDispatch();

  useEffect(() => {
    setLoading(true);
    dispatch(getReport(publicId)).then((data) => {
      setLoading(false);
      const { message = "" } = data.payload;

      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      }
      if (data?.payload?.report) {
        setReport(data?.payload?.report);
      }
    });
  }, [dispatch]);

  useEffect(() => {
    if (rowReceipts.length > 0) {
      const _approvedReceipts = rowReceipts.filter(
        (_receipt) => _receipt.status == RECEIPT_STATUS.APPROVED
      );
      setAllResolved(
        _approvedReceipts.length == rowReceipts.length &&
          report.status != REPORT_STATUS.APPROVED
      );
    }
  }, [rowReceipts]);

  useEffect(() => {
    if (!FuseUtils.isEmpty(report)) {
      setReportStatus(report.status);
      setRowReceipts(report.receipt_ids);

      var _expenses = [];
      var _amountWithoutReceipt = 0;
      var _amountPersonal = 0;
      var _totalVatExpense = 0;
      var _totalVatPersonal = 0;
      var _totalVat = 0;
      var _totalExpenseWithReceipt = 0;
      report.expense_ids.map((_expense) => {
        _totalVatExpense +=
          parseFloat(_expense.commission_amount_1.replace(",", ".")) +
          parseFloat(_expense.commission_amount_2.replace(",", ".")) +
          parseFloat(_expense.commission_amount_3.replace(",", "."));

        var temp_expense = _expense;
        _amountWithoutReceipt += parseFloat(_expense.amount_charged);
        report.receipt_ids.map((_receipt) => {
          if (_receipt.expense == temp_expense._id) {
            temp_expense.matched = true;
            _totalExpenseWithReceipt++;
            _amountWithoutReceipt -= parseFloat(_expense.amount_charged);
          }
        });
        _expenses.push(temp_expense);
      });
      report.receipt_ids.map((_receipt) => {
        var matched = false;

        if (
          _receipt.vat_amount_1 ||
          _receipt.vat_amount_2 ||
          _receipt.vat_amount_3
        ) {
          _totalVat +=
            parseFloat(_receipt.vat_amount_1) +
            parseFloat(_receipt.vat_amount_2) +
            parseFloat(_receipt.vat_amount_3);
        }

        report.expense_ids.map((_expense) => {
          if (_receipt.expense == _expense._id) {
            matched = true;
            return true;
          }
        });
        if (!matched && _receipt.amount_eur) {
          _amountPersonal += parseFloat(_receipt.amount_eur);
        }
        if (
          !matched &&
          (_receipt.vat_amount_1 ||
            _receipt.vat_amount_2 ||
            _receipt.vat_amount_3)
        ) {
          _totalVatPersonal +=
            parseFloat(_receipt.vat_amount_1) +
            parseFloat(_receipt.vat_amount_2) +
            parseFloat(_receipt.vat_amount_3);
        }
      });

      setTotalExpenseWithReceipt(_totalExpenseWithReceipt);
      setTotalPersonal(adjustFloatValue(_amountPersonal));
      setTotalWithoutReceipt(adjustFloatValue(_amountWithoutReceipt));
      setTotalVatExpense(adjustFloatValue(_totalVatExpense));
      setTotalVatPersonal(adjustFloatValue(_totalVatPersonal));
      setTotalVat(adjustFloatValue(_totalVat));

      setRowExpenses(_expenses);
    }
  }, [report]);

  const adjustFloatValue = (value) => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  };

  const handleApproveReceipt = (row) => {
    dispatch(approveReceipt(row._id)).then((data) => {
      const { message = "" } = data.payload;
      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      } else {
        const updatedReceipt = data.payload;
        setRowReceipts(
          rowReceipts.map((row) =>
            row._id === updatedReceipt._id ? updatedReceipt : row
          )
        );
      }
    });
  };

  const handleRefundReceipt = (row) => {
    dispatch(refundReceipt({ id: row._id, report_id: report._id })).then(
      (data) => {
        const { message = "" } = data.payload;
        if (!FuseUtils.isEmpty(message)) {
          _showMessage(message, "error");
        } else {
          const updatedReceipt = data.payload;
          setRowReceipts(
            rowReceipts.map((row) =>
              row._id === updatedReceipt._id ? updatedReceipt : row
            )
          );
        }
      }
    );
  };

  const handleApproveReport = () => {
    setLoading(true);
    dispatch(approveReport(publicId)).then((data) => {
      setLoading(false);
      const { message = "" } = data.payload;
      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      } else {
        setReportStatus(REPORT_STATUS.APPROVED);
      }
    });
  };

  const handleExportReport = () => {
    dispatch(
      exportReport({
        publicId,
        totalWithoutReceipt,
        totalPersonal,
        totalVat,
      })
    ).then((response) => {
      if (response?.payload?.data) {
        const url = window.URL.createObjectURL(
          new Blob([response.payload.data])
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `Report_#${publicId}_${moment().format("YYYY_MM_DD")}.zip`
        );
        document.body.appendChild(link);
        link.click();
      }
    });
  };

  const handleCloseReport = () => {
    dispatch(closeReport(publicId)).then((data) => {
      setLoading(false);
      const { message = "" } = data.payload;
      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      } else {
        props.navigate("/reports");
      }
    });
  };

  const _showMessage = (message = "", variant = "info") => {
    dispatch(
      showMessage({
        message,
        variant,
      })
    );
  };

  const toLocalTime = (time, format = "YYYY-MM-DD") => {
    return moment.utc(time).local().format(format);
  };

  const receiptColumns = [
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        return <ReceiptStatus value={params.row.status} />;
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: (params) => {
        if (params.row.expense) {
          return [
            <ApproveTooltip title="Approve" placement="top">
              <GridActionsCellItem
                icon={<VerifiedIcon sx={{ fontSize: 30 }} />}
                label="Approve"
                className="textPrimary"
                onClick={() => handleApproveReceipt(params.row)}
                color="success"
              />
            </ApproveTooltip>,
          ];
        }
        return [
          <ApproveTooltip title="Approve" placement="top">
            <GridActionsCellItem
              icon={<VerifiedIcon sx={{ fontSize: 30 }} />}
              label="Approve"
              className="textPrimary"
              onClick={() => handleApproveReceipt(params.row)}
              color="success"
            />
          </ApproveTooltip>,
          <RefundTooltip title="Refund" placement="top">
            <GridActionsCellItem
              icon={<CurrencyExchangeIcon sx={{ fontSize: 29 }} />}
              label="Refund"
              onClick={() => handleRefundReceipt(params.row)}
              color="error"
            />
          </RefundTooltip>,
        ];
      },
    },
    {
      field: "merchant_info",
      headerName: "Raison sociale commerçant",
      width: 150,
    },
    {
      field: "issued_at",
      headerName: "Issued Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.issued_at),
    },
    { field: "amount_eur", headerName: "Amount EUR", width: 100 },
    { field: "total_amount", headerName: "Amount", width: 100 },
    { field: "vat_amount_1", headerName: "VAT 1", width: 100 },
    { field: "vat_amount_2", headerName: "VAT 2", width: 100 },
    { field: "vat_amount_3", headerName: "VAT 3", width: 100 },
    { field: "currency", headerName: "Currency", width: 100 },
    { field: "country_code", headerName: "Country", width: 100 },
    {
      field: "comment",
      headerName: "Comment",
      width: 100,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.comment} placement="bottom">
            <MessageIcon />
          </Tooltip>
        );
      },
    },
  ];

  const expenseColumns = [
    {
      field: "trader_company_name",
      headerName: "Raison sociale commerçant",
      width: 250,
    },
    {
      field: "sold_at",
      headerName: "Issued Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.sold_at),
    },
    { field: "amount_charged", headerName: "Amount EUR", width: 100 },
    {
      field: "total_amount_original_currency",
      headerName: "Amount Currency",
      width: 150,
    },
    {
      field: "origin_currency_code",
      headerName: "Currency",
      width: 100,
    },
    { field: "country_code", headerName: "Country", width: 100 },
    { field: "locality", headerName: "City", width: 150 },
    { field: "commission_amount_1", headerName: "VAT 1", width: 100 },
    { field: "commission_amount_2", headerName: "VAT 2", width: 100 },
    { field: "commission_amount_3", headerName: "VAT 3", width: 100 },
  ];

  return (
    <Root
      header={
        <div className="p-24 flex">
          <div className="flex items-center self-center sm:items-start space-y-8 sm:space-y-0 w-full sm:max-w-full min-w-0">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
            >
              <Typography
                className="flex items-center"
                component={Link}
                role="button"
                to="/reports"
                color="inherit"
              >
                <FuseSvgIcon size={20}>
                  {theme.direction === "ltr"
                    ? "heroicons-outline:arrow-sm-left"
                    : "heroicons-outline:arrow-sm-right"}
                </FuseSvgIcon>
                <span className="flex mx-4 font-medium">
                  {`Report #${publicId}`}
                </span>
              </Typography>
            </motion.div>
            <div className=" ml-10 cursor-default select-none">
              <ReportStatus value={reportStatus} />
            </div>
          </div>
          <div className=" float-right">
            {reportStatus != REPORT_STATUS.APPROVED && allResolved && (
              <Button
                onClick={handleApproveReport}
                component="label"
                variant="contained"
                color="primary"
              >
                Approve
              </Button>
            )}
            {reportStatus == REPORT_STATUS.APPROVED && (
              <div className="flex">
                <Button
                  onClick={handleExportReport}
                  component="label"
                  variant="contained"
                  color="primary"
                  startIcon={<CloudDownloadIcon />}
                >
                  Export
                </Button>
                <Button
                  className=" ml-10"
                  onClick={handleCloseReport}
                  component="label"
                  variant="contained"
                  color="error"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      }
      content={
        <div style={{ width: "100%" }}>
          {loading ? (
            <FuseLoading />
          ) : (
            <div className="w-full px-5 md:px-5 pb-24 flex relative">
              <Paper className="flex flex-col w-1/2 p-24 mt-10 shadow rounded-2xl overflow-hidden">
                <div className="flex items-center">
                  <p className="w-full">Receipts</p>
                </div>
                {rowReceipts.length > 0 && (
                  <>
                    <StyledDataGrid
                      rows={rowReceipts}
                      columns={receiptColumns}
                      getRowId={(row) => row._id}
                      initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: 5 },
                        },
                      }}
                      hideFooterSelectedRowCount
                      pageSizeOptions={[5, 10]}
                      columnVisibilityModel={{
                        actions: reportStatus == REPORT_STATUS.IN_REVIEW,
                      }}
                      getRowClassName={(params) =>
                        params.row.expense
                          ? `super-app-theme--Matched`
                          : `super-app-theme--Personal`
                      }
                    />
                    <div className="pl-10">
                      <div className=" flex">
                        <p className=" mr-32">
                          Total without receipt :
                          <span className=" font-bold">
                            {" "}
                            {totalWithoutReceipt}
                          </span>{" "}
                          €
                        </p>
                        <p className="">
                          VAT Total :
                          <span className=" font-bold">
                            {" "}
                            {totalVatPersonal}
                          </span>{" "}
                          €
                        </p>
                      </div>
                      <p className="mt-5">
                        Total peronal :{" "}
                        <span className="font-bold">{totalPersonal}</span> €
                      </p>
                    </div>
                  </>
                )}
              </Paper>
              <Paper className="flex flex-col w-1/2 ml-10 p-24 mt-10 shadow rounded-2xl overflow-hidden">
                <p>Bank Expenses</p>
                {rowExpenses.length > 0 && (
                  <>
                    <StyledDataGrid
                      rows={rowExpenses}
                      columns={expenseColumns}
                      getRowId={(row) => row._id}
                      initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: 5 },
                        },
                      }}
                      hideFooterSelectedRowCount
                      pageSizeOptions={[5, 10]}
                      getRowClassName={(params) =>
                        params.row.matched
                          ? `super-app-theme--Matched`
                          : `super-app-theme--UnMatched`
                      }
                    />
                    <div className="pl-10">
                      <p>
                        <span>VAT Total :</span>
                        <span className=" font-bold"> {totalVatExpense}</span> €
                      </p>
                      <p className=" float-right font-bold text-18">
                        <span>
                          {totalExpenseWithReceipt} /{" "}
                          {report.expense_ids.length} Bank Expenses
                        </span>
                      </p>
                    </div>
                  </>
                )}
              </Paper>
            </div>
          )}
        </div>
      }
      scroll="content"
    />
  );
};

export default withReducer("reportPage", reducer)(withRouter(ReportPage));
