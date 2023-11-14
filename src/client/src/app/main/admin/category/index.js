import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import FusePageSimple from "@fuse/core/FusePageSimple";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import {
  deleteCategory,
  getCategories,
  selectCategories,
} from "./store/categorySlice";
import { useDispatch, useSelector } from "react-redux";
import withReducer from "app/store/withReducer";
import reducer from "./store";
import { useEffect, useState } from "react";
import EditCategoryModal from "./EditCategoryModal";
import AddCategoryModal from "./AddCategoryModal";
import { showMessage } from "app/store/fuse/messageSlice";
import FuseUtils from "@fuse/utils/FuseUtils";
import moment from "moment";
import Button from "@mui/material/Button";
import FuseLoading from "@fuse/core/FuseLoading";
import ConfirmDialog from "@fuse/core/ConfirmDialog";
import { Server } from "@constants";

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

const ManageCategoryPage = (props) => {
  const { t } = useTranslation("ManageCategoryPage");

  const [loading, setLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editCategory, setEditCategory] = useState({});
  const [deleteCategory_id, setDeleteCategoryID] = useState();
  const [rows, setRows] = useState([]);

  const dispatch = useDispatch();
  const { categories } = useSelector(selectCategories);

  useEffect(() => {
    setRows(categories);
  }, [categories]);

  useEffect(() => {
    setLoading(true);
    dispatch(getCategories()).then((data) => {
      const { message = "" } = data.payload;
      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      }
      setLoading(false);
    });
  }, [dispatch]);

  const handleAddCategory = () => {
    setOpenAddModal(true);
  };

  const handleEditCategory = (id) => () => {
    setEditCategory(rows.find((category) => category._id == id));
    setOpenEditModal(true);
  };

  const handleDeleteCategory = (id) => () => {
    setOpenDeleteDialog(true);
    setDeleteCategoryID(id);
  };

  const handleConfirmDelete = () => {
    setOpenDeleteDialog(false);
    dispatch(deleteCategory(deleteCategory_id)).then((data) => {
      const { message = "" } = data.payload;
      if (!FuseUtils.isEmpty(message)) {
        _showMessage(message, "error");
      } else {
        _showMessage("Deleted successfully", "info");
        setRows(rows.filter((row) => row._id !== deleteCategory_id));
      }
    });
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const handleCreatedCategory = (createdCategory) => {
    handleCloseAddModal();

    _showMessage("Successfully added!", "info");
    setRows([...rows, createdCategory]);
  };

  const handleUpdatedCategory = (updatedCategory) => {
    console.log({ updatedCategory });
    handleCloseEditModal();
    _showMessage("Successfully updated!", "info");
    setRows(
      rows.map((row) =>
        row._id === updatedCategory._id ? updatedCategory : row
      )
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
    { field: "name", headerName: "Name", width: 200 },
    {
      field: "photo",
      headerName: "Photo",
      width: 250,
      renderCell: (params) => {
        return (
          <img
            height={200}
            srcSet={`${Server.SERVER_URL}/${
              params.row.photo
            }?${Date.now()}?h=200w=248&fit=crop&auto=format`}
            src={`${Server.SERVER_URL}/${
              params.row.photo
            }?${Date.now()}?h=200w=248&fit=crop&auto=format`}
            loading="lazy"
            onLoad={() => console.log(`${params.row._id} loaded`)}
          ></img>
        );
      },
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
            onClick={handleEditCategory(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteCategory(id)}
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
              onClick={handleAddCategory}
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
              {openEditModal && (
                <EditCategoryModal
                  defaultValue={editCategory}
                  open={openEditModal}
                  handleClose={handleCloseEditModal}
                  handleUpdated={handleUpdatedCategory}
                />
              )}
              {openAddModal && (
                <AddCategoryModal
                  open={openAddModal}
                  handleClose={handleCloseAddModal}
                  handleAdded={handleCreatedCategory}
                />
              )}
              {openDeleteDialog && (
                <ConfirmDialog
                  open={openDeleteDialog}
                  onCancel={() => setOpenDeleteDialog(false)}
                  onAccept={handleConfirmDelete}
                  question="Do you want to delete this category?"
                  message="If you delete this category, all related receipts and bank expenses will be deleted."
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

export default withReducer("manageCategoryPage", reducer)(ManageCategoryPage);
