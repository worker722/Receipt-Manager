import FuseLoading from "@fuse/core/FuseLoading";
import FusePageSimple from "@fuse/core/FusePageSimple";
import FuseUtils from "@fuse/utils/FuseUtils";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { showMessage } from "app/store/fuse/messageSlice";
import withReducer from "app/store/withReducer";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import AddReceiptModal from "./AddReceiptModal";
import EditReceiptModal from "./EditReceiptModal";
import ExpenseCategoryModal from "./ExpenseCategoryModal";
import reducer from "./store";
import {
  deleteReceipt,
  getCategories,
  getReceipts,
  selectReceipts,
} from "./store/receiptSlice";

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

const ManageReceiptPage = (props) => {
  const { t } = useTranslation("ManageReceiptPage");

  const [loading, setLoading] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editReceipt, setEditReceipt] = useState({});
  const [deleteReceipt_id, setDeleteReceiptID] = useState();
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);

  const dispatch = useDispatch();
  const { receipts } = useSelector(selectReceipts);

  useEffect(() => {
    setRows(receipts);
  }, [receipts]);

  useEffect(() => {
    setLoading(true);
    dispatch(getReceipts()).then((data) => {
      const { message = "" } = data.payload;
      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      }
      setLoading(false);
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

  const handleAddReceipt = () => {
    setOpenCategoryModal(true);
  };

  const handleEditReceipt = (id) => () => {
    setEditReceipt(rows.find((receipt) => receipt._id == id));
    setOpenEditModal(true);
  };

  const handleDeleteReceipt = (id) => () => {
    setOpenDeleteDialog(true);
    setDeleteReceiptID(id);
  };

  const handleConfirmDelete = () => {
    setOpenDeleteDialog(false);
    dispatch(deleteReceipt(deleteReceipt_id)).then((data) => {
      const { message = "" } = data.payload;
      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      } else {
        _showMessage("Deleted successfully", "info");
        setRows(rows.filter((row) => row._id !== deleteReceipt_id));
      }
    });
  };

  const handleCloseCategoryModal = () => {
    setOpenCategoryModal(false);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const handleCategoryChoose = (category) => {
    setOpenAddModal(true);
    setOpenCategoryModal(false);
  };

  const handleCreatedReceipt = (createdReceipt) => {
    handleCloseAddModal();

    _showMessage("Successfully added!", "info");
    setRows([...rows, createdReceipt]);
  };

  const handleUpdatedReceipt = (updatedReceipt) => {
    handleCloseEditModal();
    _showMessage("Successfully updated!", "info");
    setRows(
      rows.map((row) => (row._id === updatedReceipt._id ? updatedReceipt : row))
    );
  };

  const _showMessage = (message = "", variant = "info") => {
    dispatch(
      showMessage({
        message,
        variant,
      })
    );
  };

  const toLocalTime = (time) => {
    return moment.utc(time).local().format("YYYY-MM-DD hh:mm:ss");
  };

  const columns = [
    {
      field: "category",
      headerName: "Category",
      width: 200,
      valueGetter: (params) => toLocalTime(params.row.category.name),
    },
    { field: "merchant_info", headerName: "Merchant", width: 200 },
    { field: "model_file", headerName: "Expense File", width: 200 },
    { field: "amount", headerName: "Amount", width: 200 },
    { field: "currency", headerName: "Currency", width: 200 },
    { field: "Country", headerName: "Country", width: 200 },
    {
      field: "issued_at",
      headerName: "Issued at",
      width: 200,
      valueGetter: (params) => toLocalTime(params.row.issued_at),
    },
    {
      field: "created_at",
      headerName: "Created at",
      width: 200,
      valueGetter: (params) => toLocalTime(params.row.created_at),
    },
    {
      field: "updated_at",
      headerName: "Updated at",
      width: 200,
      valueGetter: (params) => toLocalTime(params.row.updated_at),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditReceipt(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteReceipt(id)}
            color="inherit"
          />,
        ];
      },
    },
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
              onClick={handleAddReceipt}
              variant="contained"
              color="primary"
              aria-label="Add"
            >
              Add
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
              <DataGrid
                rows={rows}
                columns={columns}
                rowHeight={100}
                getRowId={(row) => row._id}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                  },
                }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
              />
              {openCategoryModal && (
                <ExpenseCategoryModal
                  open={openCategoryModal}
                  data={categories}
                  handleClose={handleCloseCategoryModal}
                  handleChoose={handleCategoryChoose}
                />
              )}
              {openEditModal && (
                <EditReceiptModal
                  defaultValue={editReceipt}
                  open={openEditModal}
                  handleClose={handleCloseEditModal}
                  handleUpdated={handleUpdatedReceipt}
                />
              )}
              {openAddModal && (
                <AddReceiptModal
                  open={openAddModal}
                  handleClose={handleCloseAddModal}
                  handleAdded={handleCreatedReceipt}
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

export default withReducer("manageReceiptPage", reducer)(ManageReceiptPage);
