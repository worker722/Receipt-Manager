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

  const [columns, setColumns] = useState([]);

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
      setLoading(false);
    });
  }, [dispatch]);

  const handleUploadExpenseFile = (event) => {
    if (event.target.files.length == 0) return;

    setLoading(true);
    dispatch(createExpense(event.target.files[0]))
      .then((data) => {
        setLoading(false);
        const keys = Object.keys(data.payload[0]);
        var temp_columns = [];
        keys.forEach((key) => {
          temp_columns.push({
            field: key,
            headerName: key,
            width: 200,
          });
        });
        setColumns(temp_columns);
        setRows(data?.payload);
      })
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
                  getRowId={(row) => generateRandomString(9)}
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
