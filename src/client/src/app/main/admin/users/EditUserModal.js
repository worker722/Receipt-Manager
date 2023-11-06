import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateUser } from "./store/usersSlice";
import { Box } from "@mui/material";
import FuseLoading from "@fuse/core/FuseLoading";

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  fullName: yup.string().required("You must enter display name"),
  email: yup
    .string()
    .email("You must enter a valid email")
    .required("You must enter a email"),
  password: yup
    .string()
    .required("Please enter your password.")
    .min(8, "Password is too short - should be 8 chars minimum."),
});

const defaultValues = {
  fullName: "",
  email: "",
  password: "",
};

export default function EditUserModal({
  defaultValue = {},
  open = false,
  handleClose = {},
  handleUpdated = {},
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const { control, formState, handleSubmit, setValue } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: yupResolver(schema),
  });
  const { isValid, dirtyFields, errors, setError } = formState;

  useEffect(() => {
    setValue("email", defaultValue?.email ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("fullName", defaultValue?.name ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [setValue, defaultValue]);

  const onSubmit = ({ fullName, password, email }) => {
    setLoading(true);
    dispatch(
      updateUser({ _id: defaultValue._id, fullName, email, password })
    ).then((data) => {
      // showMessage({
      //   message: "Success!",
      //   variant: "info",
      // });
      handleUpdated(data.payload);
    });
  };

  const _onClose = (event, reason) => {
    if (reason == "escapeKeyDown" || reason == "backdropClick") {
      // Unknown event, cannot be closed without user interactions
    } else {
      // Can be added saving change confirmation like: 'There are some unsaved changes. Do you want to leave?'
      handleClose && handleClose();
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={_onClose}
        aria-labelledby="fuse-dialog-title"
        maxWidth={"sm"}
        fullWidth={true}
        classes={{
          paper: "rounded-8",
        }}
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <form
            name="updateUserForm"
            noValidate
            className="flex flex-col justify-center w-full mt-32"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className="mb-24"
                  label="Full name"
                  autoFocus
                  type="name"
                  placeholder="John Doe"
                  error={!!errors.fullName}
                  helperText={errors?.fullName?.message}
                  variant="outlined"
                  required
                  fullWidth
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className="mb-24"
                  label="Email"
                  type="email"
                  error={!!errors.email}
                  helperText={errors?.email?.message}
                  variant="outlined"
                  required
                  fullWidth
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className="mb-24"
                  label="Password"
                  type="password"
                  error={!!errors.password}
                  helperText={errors?.password?.message}
                  variant="outlined"
                  required
                  fullWidth
                />
              )}
            />
            <Box>
              <Button
                variant="outlined"
                color={"error"}
                className="w-full mt-20"
                aria-label="Cancel"
                onClick={_onClose}
              >
                Cancel
              </Button>
              {!loading ? (
                <Button
                  variant="contained"
                  color="success"
                  className=" w-full mt-10 "
                  aria-label="Save"
                  type="submit"
                  disabled={_.isEmpty(dirtyFields) || !isValid}
                >
                  Save
                </Button>
              ) : (
                <FuseLoading showLabel={false} delay={0} />
              )}
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
