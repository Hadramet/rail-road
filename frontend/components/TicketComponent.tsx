import { Card, Chip, Typography } from "@mui/material";
import { BigNumber, ethers } from "ethers";
import cx from "clsx";
import { DirectionsBusFilled, SubwayOutlined } from "@mui/icons-material";
import TrainIcon from "@mui/icons-material/Train";
import { makeStyles } from "@material-ui/core/styles";
import { LoadingButton } from "@mui/lab";
import { useVerticalRipStyles } from "@mui-treasury/styles/rip/vertical";
import { memo, useEffect, useState } from "react";

const mainColor = "#003399";
const lightColor = "#ecf2ff";
const borderRadius = 12;
const useStyles = makeStyles(({ palette, breakpoints }) => ({
  card: {
    overflow: "visible",
    margin: 4,
    background: "none",
    display: "flex",
    minWidth: 343,
    minHeight: 150,
    filter: "drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.3))",
    "& $moveLeft, $moveRight": {
      transition: "0.3s",
    },
    "&:hover": {
      "& $moveLeft": {
        transform: "translateX(-8px)",
      },
      "& $moveRight": {
        transform: "translateX(8px)",
      },
    },
    [breakpoints.up("sm")]: {
      minWidth: 400,
    },
  },
  left: {
    borderTopLeftRadius: borderRadius,
    borderBottomLeftRadius: borderRadius,
    flexBasis: "33.33%",
    display: "flex",
    backgroundColor: "#fff",
    flexDirection: "column",
  },
  media: {
    margin: "auto",
    width: "auto",
    height: "auto",
    borderRadius: "15%",
  },
  right: {
    borderTopRightRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
    flex: 1,
    padding: 12,
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: lightColor,
  },
  label: {
    padding: "0 8px",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 0,
    marginBottom: 4,
  },
  subheader: {
    fontSize: 12,
    margin: 0,
    color: palette.text.secondary,
  },
  path: {
    flex: 1,
    flexBasis: 72,
    padding: "0 4px",
  },
  oldPrice: {
    textDecoration: "line-through",
  },
  line: {
    position: "relative",
    margin: "20px 0 16px",
    borderBottom: "1px dashed rgba(0,0,0,0.38)",
  },
  plane: {
    position: "absolute",
    display: "inline-block",
    padding: "0 4px",
    fontSize: 32,
    backgroundColor: lightColor,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  flight: {
    fontSize: 14,
    lineHeight: "24px",
    minWidth: 48,
    padding: "0 8px",
    borderRadius: 40,
    backgroundColor: "#bed0f5",
    color: mainColor,
    display: "block",
  },
  moveLeft: {},
  moveRight: {},
}));
const VerticalTicketRip = ({ classes }: { classes: any }) => (
  <>
    <div className={classes.left}>
      <div className={classes.sheet}>
        <div className={classes.tear} />
      </div>
    </div>
    <div className={classes.right}>
      <div className={classes.sheet}>
        <div className={classes.tear} />
      </div>
    </div>
  </>
);
type ItemProps = {
  discount?: string;
  transportNum: string;
  type: number;
  price?: number;
  from: string;
  to: string;
  startTime: string;
  endTime: string;
  isBuyingLoading: boolean;
  buy: CallableFunction;
};

export const TicketComponent = memo(function TicketCard(props: ItemProps) {
  const [discounPrice, setDiscountPrice] = useState<number>();
  const [validDiscount, setValidDiscount] = useState<boolean>(false);

  const styles = useStyles();

  const ripStyles = useVerticalRipStyles({
    size: 24,
    rightColor: lightColor,
    tearColor: mainColor,
  });

  useEffect(() => {
    if (props.discount && props.price) {
      let initialPrice = props.price;
      const disValue = (initialPrice * parseInt(props.discount || "0")) / 100;
      const isValid = disValue > 0;
      setDiscountPrice(initialPrice - disValue);
      setValidDiscount(isValid);
    }
  }, [props]);

  if (!props.price) return <div>loading ...</div>;

  return (
    <div>
      <Card className={styles.card} elevation={0}>
        <div className={cx(styles.left, styles.moveLeft)}>
          <div>
            <LoadingButton
              className={styles.media}
              loading={props.isBuyingLoading}
              onClick={() => props.buy(props.type)}
              variant="text"
            >
              {" "}
              BUY{" "}
            </LoadingButton>
            <div style={{ padding: "10px" }}>
              <Typography align="center" variant="caption">
                {" "}
                {validDiscount ? (
                  <p className={styles.oldPrice}>{`${ethers.utils.formatEther(
                    BigNumber.from(props.price || 0)
                  )} ETH`}</p>
                ) : (
                  <p>{`${ethers.utils.formatEther(
                    BigNumber.from(props.price || 0)
                  )} ETH`}</p>
                )}
              </Typography>

              <div>
                {validDiscount && (
                  <Typography align="center" variant="caption">
                    <div>
                      <p>{`${ethers.utils.formatEther(
                        BigNumber.from(discounPrice || 0)
                      )} ETH`}</p>
                      <Chip
                        variant="filled"
                        color="success"
                        label={`- ${props.discount}%`}
                      />
                    </div>
                  </Typography>
                )}
              </div>
            </div>
          </div>
        </div>
        <VerticalTicketRip
          classes={{
            ...ripStyles,
            left: cx(ripStyles.left, styles.moveLeft),
            right: cx(ripStyles.right, styles.moveRight),
          }}
        />
        <div className={cx(styles.right, styles.moveRight)}>
          <div className={styles.label}>
            <h2 className={styles.heading}>{props.from.toUpperCase()}</h2>
            <p className={styles.subheader}>{props.startTime}</p>
          </div>
          <div className={styles.path}>
            <div className={styles.line}>
              {props.type == 1 && (
                <DirectionsBusFilled className={styles.plane} />
              )}
              {props.type == 2 && <SubwayOutlined className={styles.plane} />}
              {props.type == 3 && <TrainIcon className={styles.plane} />}
            </div>
            <span className={styles.flight}>{props.transportNum}</span>
          </div>
          <div className={styles.label}>
            <h2 className={styles.heading}>{props.to.toUpperCase()}</h2>
            <p className={styles.subheader}>{props.endTime}</p>
          </div>
        </div>
      </Card>
    </div>
  );
});
