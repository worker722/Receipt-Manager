import FuseLoading from "@fuse/core/FuseLoading";
import FusePageSimple from "@fuse/core/FusePageSimple";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import withRouter from "@fuse/core/withRouter";
import FuseUtils from "@fuse/utils/FuseUtils";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Box, Button } from "@mui/material";
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
import { REPORT_STATUS, approveReport, getReport } from "./store/reportSlice";

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
  const [totalPrice, setTotalPrice] = useState(0);

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
      report.expense_ids.map((_expense) => {
        var temp_expense = _expense;
        report.receipt_ids.map((_receipt) => {
          if (_receipt.expense == temp_expense._id) {
            temp_expense.matched = true;
          }
        });
        _expenses.push(temp_expense);
      });
      setRowExpenses(_expenses);
    }
  }, [report]);

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

  const CustomFooterStatusComponent = (props) => {
    return (
      <div className="w-full">
        <Box className=" float-right" sx={{ p: 1, display: "flex" }}>
          {/* Total */}
        </Box>
      </div>
    );
  };

  const receiptColumns = [
    {
      field: "matched",
      headerName: "",
      width: 20,
      renderCell: (params) => {
        const validated = params.row.expense;
        return (
          <FuseSvgIcon
            className={validated ? "text-green" : "text-grey"}
            size={20}
          >
            heroicons-outline:check-circle
          </FuseSvgIcon>
        );
      },
    },
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
        return [
          <ApproveTooltip title="Approve" placement="top">
            <GridActionsCellItem
              icon={<VerifiedIcon />}
              label="Approve"
              className="textPrimary"
              onClick={() => handleApproveReceipt(params.row)}
              color="success"
            />
          </ApproveTooltip>,
          <RefundTooltip title="Refund" placement="top">
            <GridActionsCellItem
              icon={<CurrencyExchangeIcon />}
              label="Refund"
              onClick={() => handleRefundReceipt(params.row)}
              color="error"
            />
          </RefundTooltip>,
        ];
      },
    },
    { field: "merchant_info", headerName: "Merchant Info", width: 150 },
    {
      field: "issued_at",
      headerName: "Issued Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.issued_at),
    },
    { field: "total_amount", headerName: "Amount", width: 150 },
    { field: "currency", headerName: "Currency", width: 100 },
    { field: "country_code", headerName: "Country", width: 100 },
  ];

  const expenseColumns = [
    { field: "titular_name", headerName: "Merchant", width: 100 },
    {
      field: "treatmented_at",
      headerName: "Issued Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.treatmented_at),
    },
    { field: "amount_charged", headerName: "Amount", width: 100 },
    {
      field: "origin_currency_code",
      headerName: "Currency",
      width: 100,
    },
    { field: "country_code", headerName: "Country", width: 100 },
    { field: "locality", headerName: "City", width: 150 },
    { field: "commission_amount_1", headerName: "Vat 1", width: 100 },
    { field: "commission_amount_2", headerName: "Vat 2", width: 100 },
    { field: "commission_amount_3", headerName: "Vat 3", width: 100 },
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
            {allResolved && (
              <Button
                onClick={handleApproveReport}
                component="label"
                variant="contained"
                color="primary"
              >
                Approve
              </Button>
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
                  <StyledDataGrid
                    rows={rowReceipts}
                    columns={receiptColumns}
                    getRowId={(row) => row._id}
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                      },
                    }}
                    pageSizeOptions={[5, 10]}
                    columnVisibilityModel={{
                      actions: reportStatus == REPORT_STATUS.IN_REVIEW,
                    }}
                    slots={{
                      footer: CustomFooterStatusComponent,
                    }}
                  />
                )}
              </Paper>
              <Paper className="flex flex-col w-1/2 ml-10 p-24 mt-10 shadow rounded-2xl overflow-hidden">
                <p>Expenses</p>
                {rowExpenses.length > 0 && (
                  <StyledDataGrid
                    rows={rowExpenses}
                    columns={expenseColumns}
                    getRowId={(row) => row._id}
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                      },
                    }}
                    pageSizeOptions={[5, 10]}
                    getRowClassName={(params) =>
                      params.row.matched
                        ? `super-app-theme--Matched`
                        : `super-app-theme`
                    }
                  />
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
