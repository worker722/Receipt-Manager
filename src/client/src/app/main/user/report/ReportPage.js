import ConfirmDialog from "@fuse/core/ConfirmDialog";
import FuseLoading from "@fuse/core/FuseLoading";
import FusePageSimple from "@fuse/core/FusePageSimple";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import withRouter from "@fuse/core/withRouter";
import FuseUtils from "@fuse/utils/FuseUtils";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import { Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
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
  const [deleteReceiptId, setDeleteReceiptID] = useState();
  const [editable, setEditable] = useState(false);
  // Modal
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openAddReceiptModal, setOpenAddReceiptModal] = useState(false);
  const [openEditReceiptModal, setOpenEditReceiptModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const theme = useTheme();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getReport(publicId)).then((data) => {
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

      if (
        report.status == REPORT_STATUS.IN_PROGRESS ||
        report.status == REPORT_STATUS.REFUNDED
      )
        setEditable(true);
    }
  }, [report]);

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
    setOpenAddReceiptModal(true);
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

  const handelUploadReceipt = () => {
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
    { field: "merchant_info", headerName: "Merchant Info", width: 150 },
    {
      field: "issued_at",
      headerName: "Issued Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.issued_at),
    },
    { field: "total_amount", headerName: "Total Amount", width: 150 },
    { field: "currency", headerName: "Currency", width: 100 },
    { field: "country_code", headerName: "Country", width: 100 },
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
      field: "treatmented_at",
      headerName: "Treatment Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.treatmented_at),
    },
    { field: "titular_name", headerName: "Titular Name", width: 100 },
    { field: "amount_charged", headerName: "Amount Charged", width: 150 },
    {
      field: "origin_currency_code",
      headerName: "Origin Currency Code",
      width: 150,
    },
    {
      field: "total_amount_original_currency",
      headerName: "Total Amount Original Currency",
      width: 150,
    },
    { field: "commission_amount_1", headerName: "Commission 1", width: 150 },
    { field: "commission_amount_2", headerName: "Commission 2", width: 150 },
    { field: "commission_amount_3", headerName: "Commission 3", width: 150 },
    { field: "country_code", headerName: "Country Code", width: 150 },
    { field: "locality", headerName: "Locality", width: 150 },
    {
      field: "trader_company_name",
      headerName: "Trader Company Name",
      width: 150,
    },
    {
      field: "operation_location_code",
      headerName: "Operation Location Code",
      width: 150,
    },
    {
      field: "contracting_by_number",
      headerName: "Contracting by Number",
      width: 200,
    },
    { field: "contract_number", headerName: "Contract Number", width: 150 },

    {
      field: "employee_identifier",
      headerName: "Employee Identifier",
      width: 100,
    },
    { field: "card_number", headerName: "Card Number", width: 150 },
    {
      field: "card_created_at",
      headerName: "Card Create Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.card_created_at),
    },
    {
      field: "sold_at",
      headerName: "Sale Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.sold_at),
    },
    {
      field: "closed_at",
      headerName: "Closed Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.closed_at),
    },
    {
      field: "taken_into_account_at",
      headerName: "Taken Into Account Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.taken_into_account_at),
    },
    { field: "operation_code", headerName: "Operation Code", width: 150 },
    {
      field: "under_code_operation",
      headerName: "Under Operation Code",
      width: 150,
    },
    {
      field: "direction_of_operation",
      headerName: "Direction of Operation",
      width: 150,
    },
    { field: "code_department", headerName: "Code Department", width: 150 },

    { field: "code_mcc", headerName: "Code Mcc", width: 150 },
    { field: "operation_time", headerName: "Operation Time", width: 150 },
    { field: "execution_area", headerName: "Execution Area", width: 150 },
    {
      field: "merchant_siret_number",
      headerName: "Merchat Siret Number",
      width: 150,
    },
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
                  <p className="w-full">Receipts</p>
                  {editable && (
                    <IconButton
                      className=" float-right"
                      variant="text"
                      color="info"
                      aria-label="Add"
                      onClick={handelUploadReceipt}
                    >
                      <FuseSvgIcon size={30}>
                        heroicons-outline:plus-circle
                      </FuseSvgIcon>
                    </IconButton>
                  )}
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
                    onRowDoubleClick={(row) =>
                      editable && handleDoubleClick(row)
                    }
                    columnVisibilityModel={{
                      actions: editable,
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
              category={currentCategory}
              open={openAddReceiptModal}
              handleClose={handleCloseAddReceiptModal}
              handleAdded={handleCreatedReceipt}
            />
          )}
          {openEditReceiptModal && (
            <EditReceiptModal
              receipt={currentReceipt}
              open={openEditReceiptModal}
              handleClose={handleCloseEditReceiptModal}
              handleAdded={handleUpdatedReceipt}
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
