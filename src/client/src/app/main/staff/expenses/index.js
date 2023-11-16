import FuseLoading from "@fuse/core/FuseLoading";
import FusePageSimple from "@fuse/core/FusePageSimple";
import FuseUtils from "@fuse/utils/FuseUtils";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { styled } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { showMessage } from "app/store/fuse/messageSlice";
import withReducer from "app/store/withReducer";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import reducer from "./store";
import {
  createExpense,
  getExpenses,
  selectExpenses,
} from "./store/expensesSlice";

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

const a11yProps = (index) => {
  return {
    id: `expense-tab-${index}`,
    "aria-controls": `expense-tabpanel-${index}`,
  };
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ManageExpensesPage = (props) => {
  const { t } = useTranslation("ManageExpensesPage");

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const [value, setValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const dispatch = useDispatch();
  const { expenses } = useSelector(selectExpenses);

  useEffect(() => {
    setRows(expenses);
  }, [expenses]);

  useEffect(() => {
    setLoading(true);
    dispatch(getExpenses()).then((data) => {
      const { message = "" } = data.payload;
      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      }

      setRows(data?.payload.expenses);
      setLoading(false);
    });
  }, [dispatch]);

  const handleUploadExpenseFile = (event) => {
    if (event.target.files.length == 0) return;

    setLoading(true);
    dispatch(createExpense(event.target.files[0])).then((data) => {
      setLoading(false);
      setRows([...rows, ...data?.payload]);
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

  const columns = [
    {
      field: "treatmented_at",
      headerName: "Treatment Date",
      width: 150,
      valueGetter: (params) => toLocalTime(params.row.treatmented_at),
    },
    {
      field: "contracting_by_number",
      headerName: "Contracting by Number",
      width: 200,
    },
    { field: "contract_number", headerName: "Contract Number", width: 150 },
    {
      field: "operation_location_code",
      headerName: "Operation Location Code",
      width: 150,
    },
    { field: "titular_name", headerName: "Titular Name", width: 100 },
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
    {
      field: "trader_company_name",
      headerName: "Trader Company Name",
      width: 150,
    },
    { field: "code_department", headerName: "Code Department", width: 150 },
    { field: "country_code", headerName: "Country Code", width: 150 },
    { field: "locality", headerName: "Locality", width: 150 },
    { field: "code_mcc", headerName: "Code Mcc", width: 150 },
    { field: "operation_time", headerName: "Operation Time", width: 150 },
    { field: "execution_area", headerName: "Execution Area", width: 150 },
    {
      field: "merchant_siret_number",
      headerName: "Merchat Siret Number",
      width: 150,
    },
    { field: "commission_amount_1", headerName: "Commission 1", width: 150 },
    { field: "commission_amount_2", headerName: "Commission 2", width: 150 },
    { field: "commission_amount_3", headerName: "Commission 3", width: 150 },
  ];

  return (
    <Root
      header={
        <div className="p-24 flex">
          <div className=" self-center flex-none">
            <h4>{t("PAGE_TITLE")}</h4>
          </div>
          <div className=" pl-32 pr-32 w-full">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handleTabChange}
                aria-label="expense month filter tab"
              >
                <Tab label="Item One" {...a11yProps(0)} />
                <Tab label="Item Two" {...a11yProps(1)} />
                <Tab label="Item Three" {...a11yProps(2)} />
              </Tabs>
            </Box>
          </div>
          <div className=" mt-3">
            <Button
              component="label"
              variant="contained"
              color="primary"
              className=" float-right"
              startIcon={<CloudUploadIcon />}
            >
              Upload
              <VisuallyHiddenInput
                onChange={handleUploadExpenseFile}
                accept=".xlsx, .xls, .csv"
                type="file"
              />
            </Button>
          </div>
        </div>
      }
      content={
        <div style={{ width: "100%" }}>
          {loading ? (
            <FuseLoading />
          ) : (
            <>
              {rows.length > 0 && columns.length > 0 && (
                <DataGrid
                  rows={rows}
                  columns={columns}
                  getRowId={(row) => row._id}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 10 },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                  checkboxSelection
                />
              )}
            </>
          )}
        </div>
      }
      scroll="content"
    />
  );
};

export default withReducer("manageExpensesPage", reducer)(ManageExpensesPage);
