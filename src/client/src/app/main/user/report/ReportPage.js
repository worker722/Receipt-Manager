import { Server } from "@constants";
import ConfirmDialog from "@fuse/core/ConfirmDialog";
import FuseLoading from "@fuse/core/FuseLoading";
import FusePageSimple from "@fuse/core/FusePageSimple";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import withRouter from "@fuse/core/withRouter";
import FuseUtils from "@fuse/utils/FuseUtils";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import MessageIcon from "@mui/icons-material/Message";
import { Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
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
import AddReceiptModal from "./AddReceiptModal";
import EditReceiptModal from "./EditReceiptModal";
import ExpenseCategoryModal from "./ExpenseCategoryModal";
import ReceiptStatus from "./ReceiptStatus";
import ReportStatus from "./ReportStatus";
import reducer from "./store";
import { deleteReceipt, getCategories } from "./store/receiptSlice";
import {
  REPORT_STATUS,
  getReport,
  matchReport,
  submitReport,
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
  "& .super-app-theme--Lost": {
    backgroundColor: getBackgroundColor(
      theme.palette.secondary.light,
      theme.palette.mode
    ),
    "&:hover": {
      backgroundColor: getHoverBackgroundColor(
        theme.palette.secondary.light,
        theme.palette.mode
      ),
    },
    "&.Mui-selected": {
      backgroundColor: getSelectedBackgroundColor(
        theme.palette.secondary.light,
        theme.palette.mode
      ),
      "&:hover": {
        backgroundColor: getSelectedHoverBackgroundColor(
          theme.palette.secondary.light,
          theme.palette.mode
        ),
      },
    },
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
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState({});
  const [currentReceipt, setCurrentReceipt] = useState({});
  const [currentExpense, setCurrentExpense] = useState(false);
  const [deleteReceiptId, setDeleteReceiptID] = useState();
  const [editable, setEditable] = useState(false);
  const [totalWithoutReceipt, setTotalWithoutReceipt] = useState(0);
  const [totalPersonal, setTotalPersonal] = useState(0);
  const [totalVatExpense, setTotalVatExpense] = useState(0);
  const [totalVatPersonal, setTotalVatPersonal] = useState(0);
  const [totalExpenseWithReceipt, setTotalExpenseWithReceipt] = useState(0);

  // Modal
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openAddReceiptModal, setOpenAddReceiptModal] = useState(false);
  const [openEditReceiptModal, setOpenEditReceiptModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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

    dispatch(getCategories()).then((data) => {
      const { message = "" } = data.payload;
      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      } else {
        setCategories(data.payload.categories);
      }
    });
  }, [dispatch]);

  useEffect(() => {
    if (!FuseUtils.isEmpty(report)) {
      setRowReceipts(report.receipt_ids);
      var _expenses = [];
      var _amountWithoutReceipt = 0;
      var _amountPersonal = 0;
      var _totalVatExpense = 0;
      var _totalVatPersonal = 0;
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

      setRowExpenses(_expenses);

      if (
        report.status == REPORT_STATUS.IN_PROGRESS ||
        report.status == REPORT_STATUS.REJECTED
      )
        setEditable(true);
    }
  }, [report]);

  const adjustFloatValue = (value) => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
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

  const handleCloseCategoryModal = () => {
    setOpenCategoryModal(false);
  };

  const handleCloseAddReceiptModal = () => {
    setOpenAddReceiptModal(false);
  };

  const handleCloseEditReceiptModal = () => {
    setOpenEditReceiptModal(false);
  };

  const handleCategoryChoose = (category) => {
    setCurrentCategory(category);
    if (!openEditReceiptModal) setOpenAddReceiptModal(true);
    setOpenCategoryModal(false);
  };

  const handleCreatedReceipt = (createdReceipt) => {
    handleCloseAddReceiptModal();

    setRowReceipts([...rowReceipts, createdReceipt]);
  };

  const handleUpdatedReceipt = (updatedReceipt) => {
    handleCloseEditReceiptModal();

    setRowReceipts(
      rowReceipts.map((row) =>
        row._id === updatedReceipt._id ? updatedReceipt : row
      )
    );
  };

  const handelUploadReceipt = (row = false) => {
    setCurrentExpense(row);
    setOpenCategoryModal(true);
  };

  const handelMatch = () => {
    setLoading(true);
    dispatch(matchReport(publicId)).then((data) => {
      setLoading(false);
      const { message = "" } = data.payload;

      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      }
      if (data?.payload?.report) {
        setReport(data?.payload?.report);
      }
    });
  };

  const handleEditReceipt = (_receipt) => {
    setCurrentReceipt(_receipt);
    setOpenEditReceiptModal(true);
  };

  const handleDeleteReceipt = (_receipt) => {
    setDeleteReceiptID(_receipt._id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setOpenDeleteDialog(false);
    setLoading(true);
    dispatch(deleteReceipt(deleteReceiptId)).then((data) => {
      setLoading(false);
      const { message = "" } = data.payload;
      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      } else {
        _showMessage("Deleted successfully", "info");
        setRowReceipts(
          rowReceipts.filter((row) => row._id !== deleteReceiptId)
        );
      }
    });
  };

  const handleSubmit = () => {
    setLoading(true);
    dispatch(submitReport(publicId)).then((data) => {
      setLoading(false);
      if (data?.payload) {
        props.navigate("/me/reports");
      }
    });
  };

  const handleDoubleClick = (params) => {
    handleEditReceipt(params.row);
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
      field: "type",
      headerName: "Type",
      width: 80,
      renderCell: (params) => {
        return (
          <img
            src={`${Server.SERVER_URL}/${params.row.category.photo}`}
            width={50}
          ></img>
        );
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
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: (params) => {
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={() => handleEditReceipt(params.row)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDeleteReceipt(params.row)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const expenseColumns = [
    {
      field: "matched",
      headerName: "",
      width: 30,
      renderCell: (params) => {
        return params.row.matched ? (
          <></>
        ) : (
          <IconButton
            variant="text"
            color="info"
            aria-label="Add"
            onClick={() => handelUploadReceipt(params.row)}
          >
            <FuseSvgIcon size={25}>heroicons-outline:plus-circle</FuseSvgIcon>
          </IconButton>
        );
      },
    },
    {
      field: "trader_company_name",
      headerName: "Raison sociale commerçant",
      width: 220,
    },
    {
      field: "sold_at",
      headerName: "Issued Date",
      width: 100,
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
                to="/me/reports"
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
              <ReportStatus value={report.status} />
            </div>
          </div>
          <div className=" float-right">
            {rowReceipts.length > 0 && editable && (
              <Button
                component="label"
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Submit
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
              {editable && (
                <IconButton
                  onClick={handelMatch}
                  disabled={!rowReceipts.length > 0}
                  style={{
                    backgroundColor:
                      rowReceipts.length > 0 ? "#0f172a" : "#0f172a80",
                  }}
                  className="absolute top-[calc(50%-20px)] left-[calc(50%-20px)]"
                >
                  <FuseSvgIcon className=" text-white" size={22}>
                    heroicons-outline:switch-horizontal
                  </FuseSvgIcon>
                </IconButton>
              )}
              <Paper className="flex flex-col w-1/2 p-24 mt-10 shadow rounded-2xl overflow-hidden">
                <div className="flex items-center">
                  <p className="w-full text-15 font-semibold">Receipts</p>
                  {editable && (
                    <IconButton
                      className=" float-right"
                      variant="text"
                      color="info"
                      aria-label="Add"
                      onClick={() => handelUploadReceipt()}
                    >
                      <FuseSvgIcon size={30}>
                        heroicons-outline:plus-circle
                      </FuseSvgIcon>
                    </IconButton>
                  )}
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
                      pagination
                      hideFooterSelectedRowCount
                      pageSizeOptions={[5, 10]}
                      onRowDoubleClick={handleDoubleClick}
                      columnVisibilityModel={{
                        actions: editable,
                      }}
                      getRowClassName={(params) => {
                        if (params.row.is_lost) {
                          return `super-app-theme--Lost`;
                        } else if (params.row.expense)
                          return `super-app-theme--Matched`;
                        return `super-app-theme--Personal`;
                      }}
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
                <p className="text-15 font-semibold">Bank Expenses</p>
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
                      columnVisibilityModel={{
                        matched: editable,
                      }}
                    />
                    <div className="pl-10">
                      <p>
                        <span>VAT Total :</span>
                        <span className=" font-bold"> {totalVatExpense}</span> €
                      </p>
                      <p className=" float-right font-semibold text-15">
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

          {openCategoryModal && (
            <ExpenseCategoryModal
              open={openCategoryModal}
              data={categories}
              handleClose={handleCloseCategoryModal}
              handleChoose={handleCategoryChoose}
            />
          )}
          {openAddReceiptModal && (
            <AddReceiptModal
              report={report}
              expense={currentExpense}
              category={currentCategory}
              open={openAddReceiptModal}
              handleClose={handleCloseAddReceiptModal}
              handleAdded={handleCreatedReceipt}
            />
          )}
          {openEditReceiptModal && (
            <EditReceiptModal
              receipt={currentReceipt}
              newCategory={currentCategory}
              open={openEditReceiptModal}
              handleClose={handleCloseEditReceiptModal}
              handleAdded={handleUpdatedReceipt}
              handleOpenCategoryModal={setOpenCategoryModal}
            />
          )}
          {openDeleteDialog && (
            <ConfirmDialog
              open={openDeleteDialog}
              onCancel={() => setOpenDeleteDialog(false)}
              onAccept={handleConfirmDelete}
              question="Do you want to delete this receipt?"
            />
          )}
        </div>
      }
      scroll="content"
    />
  );
};

export default withReducer("reportPage", reducer)(withRouter(ReportPage));
