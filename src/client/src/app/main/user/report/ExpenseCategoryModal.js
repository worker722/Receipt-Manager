import { Server } from "@constants";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

export default function ExpenseCategoryModal({
  open = false,
  handleClose = {},
  handleChoose = {},
  data = [],
}) {
  const _onClose = (event, reason) => {
    handleClose && handleClose();
  };

  const handleClick = (item) => {
    handleChoose(item);
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={_onClose}
        aria-labelledby="fuse-dialog-title"
        maxWidth={"md"}
        fullWidth={true}
        classes={{
          paper: "rounded-8",
        }}
      >
        <DialogTitle>Expense Category</DialogTitle>
        <DialogContent>
          <Grid
            className=" mt-10"
            container
            justifyContent="center"
            rowSpacing={2}
            columnSpacing={{ xs: 1, sm: 2, md: 2 }}
          >
            {data.map((item) => (
              <Grid item xs={6} sm={4} md={3} key={item._id}>
                <Paper
                  onClick={() => handleClick(item)}
                  square={false}
                  sx={{
                    overflow: "hidden",
                    height: 140,
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark" ? "#1A2027" : "#77c4ff",
                  }}
                >
                  <div
                    style={{ height: 100, padding: 25 }}
                    className=" flex justify-center"
                  >
                    <img
                      width={50}
                      srcSet={`${Server.SERVER_URL}/${
                        item.photo
                      }?${Date.now()}?h=50&w=50&fit=crop&auto=format`}
                      src={`${Server.SERVER_URL}/${
                        item.photo
                      }?${Date.now()}?h=50&w=50&fit=crop&auto=format`}
                      loading="lazy"
                    ></img>
                  </div>
                  <p
                    className=" text-white text-center"
                    style={{ lineHeight: "40px", backgroundColor: "#3c94d7" }}
                  >
                    {item.name}
                  </p>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
}
