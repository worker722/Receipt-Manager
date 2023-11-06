import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import FusePageSimple from "@fuse/core/FusePageSimple";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { getUsers, selectUsers } from "./store/usersSlice";
import { useDispatch, useSelector } from "react-redux";
import withReducer from "app/store/withReducer";
import reducer from "./store";
import { useEffect, useState } from "react";
import EditUserModal from "./EditUserModal";
import { showMessage } from "app/store/fuse/messageSlice";

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

const ManageUsersPage = (props) => {
  const { t } = useTranslation("ManageUsersPage");

  const [openModal, setOpenModal] = useState(false);
  const [editUser, setEditUser] = useState({});
  const [rows, setRows] = useState([]);

  const dispatch = useDispatch();
  const { users } = useSelector(selectUsers);

  useEffect(() => {
    setRows(users);
  }, [users]);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const handleEditUser = (id) => () => {
    setEditUser(users.find((user) => user._id == id));
    setOpenModal(true);
  };

  const handleDeleteUser = (id) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleUpdatedUser = (updatedUser) => {
    handleCloseModal();
    dispatch(
      showMessage({
        message: "Successfully updated!",
        variant: "info",
      })
    );
    setRows(
      rows.map((row) => (row._id === updatedUser._id ? updatedUser : row))
    );
  };

  const columns = [
    { field: "name", headerName: "Full name", width: 200, editable: true },
    { field: "email", headerName: "Email", width: 250 },
    {
      field: "role",
      headerName: "Role",
      width: 160,
      valueGetter: (params) => {
        if (`${params.row.role.name}` == "admin") return "Administrator";
        else if (`${params.row.role.name}` == "staff") return "Staff";
        else if (`${params.row.role.name}` == "user") return "User";
      },
    },
    {
      field: "created_at",
      headerName: "Created at",
      width: 200,
    },
    {
      field: "updated_at",
      headerName: "Updated at",
      width: 200,
    },
    {
      field: "active",
      headerName: "Active",
    },
    {
      field: "redirect_url",
      headerName: "Redirect URL",
      width: 200,
      valueGetter: (params) => `${params.row.role.redirect_url}`,
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
            onClick={handleEditUser(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteUser(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Root
      header={
        <div className="p-24">
          <h4>{t("PAGE_TITLE")}</h4>
        </div>
      }
      content={
        <div style={{ height: 800, width: "100%" }}>
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
          {openModal && (
            <EditUserModal
              defaultValue={editUser}
              open={openModal}
              handleClose={handleCloseModal}
              handleUpdated={handleUpdatedUser}
            />
          )}
        </div>
      }
      scroll="content"
    />
  );
};

export default withReducer("manageUsersPage", reducer)(ManageUsersPage);
