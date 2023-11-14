import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import FusePageSimple from "@fuse/core/FusePageSimple";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import {
  getExpenses,
  selectExpenses,
  createExpense,
} from "./store/expensesSlice";
import { useDispatch, useSelector } from "react-redux";
import withReducer from "app/store/withReducer";
import reducer from "./store";
import { useEffect, useState } from "react";
import { showMessage } from "app/store/fuse/messageSlice";
import FuseUtils from "@fuse/utils/FuseUtils";
import moment from "moment";
import FuseLoading from "@fuse/core/FuseLoading";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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
      setRows(data?.payload);
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

  const toLocalTime = (time, format = "YYYY-MM-DD hh:mm:ss") => {
    return moment.utc(time).local().format(format);
  };

  const generateRandomString = (length) => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const columns = [
    { field: "treatmented_at", headerName: "Treatment Date", width: 150 },
    {
      field: "contracting_by_number",
      headerName: "Treatment Date",
      width: 150,
    },
    { field: "contract_number", headerName: "Treatment Date", width: 150 },
    {
      field: "operation_location_code",
      headerName: "Treatment Date",
      width: 150,
    },
    { field: "titular_name", headerName: "Treatment Date", width: 150 },
    { field: "employee_identifier", headerName: "Treatment Date", width: 150 },
    { field: "card_number", headerName: "Treatment Date", width: 150 },
    { field: "card_created_at", headerName: "Treatment Date", width: 150 },
    { field: "sold_at", headerName: "Treatment Date", width: 150 },
    { field: "closed_at", headerName: "Treatment Date", width: 150 },
    {
      field: "taken_into_account_at",
      headerName: "Treatment Date",
      width: 150,
    },
    { field: "operation_code", headerName: "Treatment Date", width: 150 },
    { field: "under_code_operation", headerName: "Treatment Date", width: 150 },
    {
      field: "direction_of_operation",
      headerName: "Treatment Date",
      width: 150,
    },
    { field: "amount_charged", headerName: "Treatment Date", width: 150 },
    { field: "origin_currency_code", headerName: "Treatment Date", width: 150 },
    {
      field: "total_amount_original_currency",
      headerName: "Treatment Date",
      width: 150,
    },
    { field: "trader_company_name", headerName: "Treatment Date", width: 150 },
    { field: "code_department", headerName: "Treatment Date", width: 150 },
    { field: "country_code", headerName: "Treatment Date", width: 150 },
    { field: "locality", headerName: "Treatment Date", width: 150 },
    { field: "code_mcc", headerName: "Treatment Date", width: 150 },
    { field: "operation_time", headerName: "Treatment Date", width: 150 },
    { field: "execution_area", headerName: "Treatment Date", width: 150 },
    {
      field: "merchant_siret_number",
      headerName: "Treatment Date",
      width: 150,
    },
    { field: "commission_amount_1", headerName: "Treatment Date", width: 150 },
    { field: "commission_amount_2", headerName: "Treatment Date", width: 150 },
    { field: "commission_amount_3", headerName: "Treatment Date", width: 150 },
  ];

  return (
    <Root
      header={
        <div className="p-24 flex">
          <div className="w-full self-center">
            <h4>{t("PAGE_TITLE")}</h4>
          </div>
          <div className="float-right">
            <Button
              component="label"
              variant="contained"
              color="primary"
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
