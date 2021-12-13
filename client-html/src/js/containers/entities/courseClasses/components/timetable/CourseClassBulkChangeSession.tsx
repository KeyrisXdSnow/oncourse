/*
 * Copyright ish group pty ltd. All rights reserved. https://www.ish.com.au
 * No copying or use of this code is allowed without permission in writing from ish.
 */

import React, {
  useCallback, useEffect, useMemo, useState
} from "react";
import clsx from "clsx";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { arrayPush, arrayRemove, change, Field, getFormValues, initialize, reduxForm, submit } from "redux-form";
import Dialog from "@mui/material/Dialog";
import Grid from "@mui/material/Grid";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";
import Collapse from "@mui/material/Collapse";
import { TutorAttendance } from "@api/model";
import {
  addDays, differenceInMinutes, format as formatDate, subDays
} from "date-fns";
import FormField from "../../../../../common/components/form/formFields/FormField";
import { State } from "../../../../../reducers/state";
import { CourseClassTutorExtended } from "../../../../../model/entities/CourseClass";
import { stubFunction } from "../../../../../common/utils/common";
import { greaterThanNullValidation } from "../../../../../common/utils/validation";
import EditInPlaceDurationField from "../../../../../common/components/form/formFields/EditInPlaceDurationField";
import { courseClassCloseBulkUpdateModal } from "./actions";
import { getCommonPlainRecords, setCommonPlainSearch } from "../../../../../common/actions/CommonPlainRecordsActions";
import { DD_MMM_YYYY } from "../../../../../common/utils/dates/format";
import CourseClassTutorRooster from "./CourseClassTutorRooster";

const COURSE_CLASS_BULK_UPDATE_FORM: string = "CourseClassBulkUpdateForm";

const styles = theme => createStyles({
  paperDialog: {
    background: theme.palette.background.default
  },
  bulkChangeDialogContent: {
    "&:first-child": {
      paddingTop: theme.spacing(1)
    },
  },
  checkboxes: {
    marginLeft: theme.spacing(-1.25)
  },
  bulkChangeDaysInput: {
    maxWidth: theme.spacing(10)
  },
  bullkWrapperItem: {
    paddingLeft: theme.spacing(5)
  },
  disabledHeading: {
    color: `${theme.palette.text.secondary} !important`
  }
});

const validateDuration = value => (value !== "" && (value < 5 || value > 1440)
  ? "Each entry in the timetable cannot be shorter than 5 minutes or longer than 24 hours."
  : undefined);

export const initialValues = {
  tutorAttendances: [],
  tutorsChecked: false,
  locationChecked: false,
  siteId: null,
  roomId: null,
  room: "",
  site: "",
  siteTimezone: "",
  startChecked: false,
  start: "",
  durationChecked: false,
  duration: 0,
  payableDurationChecked: false,
  payableDuration: 0,
  moveForwardChecked: false,
  moveForward: "",
  moveBackwardChecked: false,
  moveBackward: ""
};


const BulkItemWrapper: React.FC<any> = props => {
  const {
    classes, title, name, children, noCollapse
  } = props;
  const [opened, setOpened] = React.useState(false);

  const onChange = React.useCallback(checked => {
    setOpened(checked);
  }, [name]);

  const renderedTitle = (
    <Typography variant="body2" className={clsx("secondaryHeading", { [classes.disabledHeading]: !opened })}>
      {title}
    </Typography>
  );

  return (
    <div className="mb-2 w-100">
      <div className="centeredFlex">
        <FormField
          type="checkbox"
          name={`${name}Checked`}
          color="secondary"
          checked={opened}
          onChange={onChange}
        />
        {noCollapse ? opened ? children : renderedTitle : renderedTitle}
      </div>
      {!noCollapse && <Collapse in={opened} className={classes.bullkWrapperItem}>{children}</Collapse>}
    </div>
  );
};

const CourseClassBulkChangeSessionForm = props => {
  const {
    handleSubmit,
    form,
    dispatch,
    reset,
    asyncValidating,
    dirty,
    invalid,
    opened,
    classes,
    init,
    tutors,
    selection,
    getRooms,
    rooms,
    bulkValues,
    sessions
  } = props;

  const [laterDate, setLaterDate] = useState<string>(null);
  const [earlierDate, setEarlierDate] = useState<string>(null);

  const classTimezone = useMemo(() => {
    if (!sessions) {
      return null;
    }
    const sessionWithTimezone = sessions.find(s => s.siteTimezone);

    return sessionWithTimezone ? sessionWithTimezone.siteTimezone : null;
  }, [sessions]);

  const [initial, setInitial] = React.useState(bulkValues || initialValues);

  const roomLabel = room => {
    if (room["site.name"]) return `${room["site.name"]} - ${room.name}`;

    return room.name;
  };

  useEffect(() => {
    if (!bulkValues) {
      init();
    } else {
      setInitial(bulkValues);
    }
  }, [bulkValues]);

  useEffect(() => {
    if (initial.siteId && !initial.roomId && rooms.length) {
      dispatch(change(form, "roomId", rooms[0].id));
      dispatch(change(form, "room", rooms[0].name));
    }
  }, [rooms]);

  useEffect(() => {
    if (!rooms.length && initial.siteId) {
      getRooms(`site.id is ${initial.siteId}`);
    }
  }, []);

  const onRoomIdChange = useCallback(
    room => {
      dispatch(change(form, "room", room ? room.name : null));
      dispatch(change(form, "site", room ? room["site.name"] : null));
      dispatch(change(form, "siteId", room ? room["site.id"] : null));
      dispatch(change(form, "siteTimezone", room ? room["site.localTimezone"] : null));
    },
    [form]
  );

  const durationValue = useMemo(() => initial.duration, [initial.duration]);

  const payableDurationValue = useMemo(() => initial.payableDuration, [initial.payableDuration]);

  const onPayableDurationChange = useCallback(
    (durationMinutes: number) => {
      if (durationMinutes !== null) {
        dispatch(change(form, "payableDuration", durationMinutes));
      }
    },
    [form, initial]
  );

  const durationError = useMemo(() => greaterThanNullValidation(durationValue) || validateDuration(durationValue), [
    durationValue
  ]);

  const onDurationChange = useCallback(
    (durationMinutes: number) => {
      if (durationMinutes) {
        dispatch(change(form, "duration", durationMinutes));
      }
    },
    []
  );

  const onClose = useCallback(() => {
    dispatch(courseClassCloseBulkUpdateModal());
    reset();
  }, []);

  const submitChanges = () => {
    dispatch(submit(form));
  };

  const onDeleteTutor = (index: number) => {
    dispatch(arrayRemove(form, `tutorAttendances`, index));
  };

  const onAddTutor = (tutor: CourseClassTutorExtended) => {
    dispatch(arrayPush(form, `tutorAttendances`, {
      id: null,
      courseClassTutorId: tutor.id,
      temporaryTutorId: tutor.temporaryId,
      contactName: tutor.tutorName,
      attendanceType: 'Not confirmed for payroll',
      note: null,
      actualPayableDurationMinutes: durationValue || differenceInMinutes(new Date(sessions[0]?.end), new Date(sessions[0]?.start)),
      hasPayslip: false,
      start: bulkValues.start || sessions[0]?.start,
      end: bulkValues.end || sessions[0]?.end,
      contactId: tutor.contactId,
      payslipIds: []
    } as TutorAttendance));
  };

  const onMoveLater = useCallback(e => {
    const days = e.target.value !== "" ? Number(e.target.value) : 0;

    if (days > 0) {
      setLaterDate(formatDate(addDays(new Date(sessions[0].start), days), DD_MMM_YYYY).toString());
    } else {
      setLaterDate(null);
    }
  }, [sessions]);

  const onMoveEarlier = useCallback(e => {
    const days = e.target.value !== "" ? Number(e.target.value) : 0;

    if (days > 0) {
      const firstSessionDate = new Date(sessions[0].start);
      const toDate = formatDate(subDays(firstSessionDate, days), DD_MMM_YYYY).toString();
      setEarlierDate(`${formatDate(firstSessionDate, DD_MMM_YYYY).toString()} to ${toDate}`);
    } else {
      setEarlierDate(null);
    }
  }, [sessions]);

  return (
    <Dialog
      open={opened}
      onClose={onClose}
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      maxWidth="md"
      fullWidth
      classes={{
        paper: classes.paperDialog
      }}
    >
      <form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <DialogContent
          classes={{
            root: classes.bulkChangeDialogContent
          }}
        >
          <Grid container>
            <Grid item xs={12}>
              <div className={clsx("centeredFlex")}>
                <div className="heading mt-2 mb-2">
                  Bulk change
                </div>
              </div>
              <div className="pb-2">
                {`Update ${selection.length} timetable event${selection.length > 1 ? "s" : ""}`}
              </div>
            </Grid>
            <Grid item xs={12} container className={classes.checkboxes}>
              <Grid item xs={12}>
                {tutors.length > 0 && (
                  <BulkItemWrapper classes={classes} title="Tutors" name="tutors" noCollapse>
                    <div className={classes.sessionTutors}>
                      <Field
                        name="tutorAttendances"
                        component={CourseClassTutorRooster}
                        session={bulkValues}
                        tutors={tutors}
                        onDeleteTutor={onDeleteTutor}
                        onAddTutor={onAddTutor}
                      />
                    </div>
                  </BulkItemWrapper>
                )}
              </Grid>
              <Grid item xs={12}>
                <BulkItemWrapper classes={classes} title="Location" name="location">
                  <Grid container columnSpacing={3}>
                    <Grid item xs={6}>
                      <FormField
                        type="remoteDataSearchSelect"
                        entity="Room"
                        name="roomId"
                        label="Site and room"
                        aqlColumns="name,site.name,site.localTimezone,site.id"
                        selectValueMark="id"
                        selectLabelCondition={roomLabel}
                        onInnerValueChange={onRoomIdChange}
                        rowHeight={36}
                        allowEmpty
                      />
                    </Grid>
                  </Grid>
                </BulkItemWrapper>
              </Grid>
              <Grid item xs={12}>
                <BulkItemWrapper classes={classes} title="Actual payable duration" name="payableDuration">
                  <Grid container>
                    <Grid item xs={6}>
                      <EditInPlaceDurationField
                        label="Actual payable duration"
                        id="actualPayableDuration"meta={{}}
                        input={{
                          value: payableDurationValue,
                          onChange: stubFunction,
                          onBlur: onPayableDurationChange,
                          onFocus: stubFunction
                        }}
                        hideLabel
                      />
                    </Grid>
                  </Grid>
                </BulkItemWrapper>
              </Grid>
              <Grid item xs={12}>
                <BulkItemWrapper
                  classes={classes}
                  title={`Start time ${initial.siteTimezone ? `(${initial.siteTimezone})` : classTimezone ? `(${classTimezone})` : ""}`}
                  name="start"
                >
                  <Grid container>
                    <Grid item xs={6}>
                      <FormField
                        type="time"
                        name="start"
                        label={`Start time ${initial.siteTimezone ? `(${initial.siteTimezone})` : classTimezone ? `(${classTimezone})` : ""}`}
                        timezone={initial.siteTimezone || classTimezone}
                        persistValue
                        hideLabel
                      />
                    </Grid>
                  </Grid>
                </BulkItemWrapper>
              </Grid>
              <Grid item xs={12}>
                <BulkItemWrapper classes={classes} title="Duration" name="duration">
                  <Grid container>
                    <Grid item xs={6}>
                      <EditInPlaceDurationField
                        label="Duration"id="duration"
                        meta={{
                          error: durationError,
                          invalid: Boolean(durationError)
                        }}
                        input={{
                          value: durationValue,
                          onChange: stubFunction,
                          onBlur: onDurationChange,
                          onFocus: stubFunction
                        }}
                        hideLabel
                      />
                    </Grid>
                  </Grid>
                </BulkItemWrapper>
              </Grid>
              <Grid item xs={12}>
                <BulkItemWrapper classes={classes} title="Move later" name="moveForward">
                  <Grid container>
                    <Grid item xs={6}>
                      <FormField
                        type="number"
                        name="moveForward"
                        formatting="inline"
                        step="1"
                        className={classes.bulkChangeDaysInput}
                        hideArrows
                      onChange={onMoveLater}
                      />
                      {" "}
                      days
                  </Grid>
                  <Grid item xs={6} id="moveForwardInfo">
                    {laterDate && `Earliest selected session will starts ${laterDate}`}
                  </Grid>
                </Grid>
              </BulkItemWrapper>
            </Grid>
            <Grid item xs={12}>
              <BulkItemWrapper classes={classes} title="Move earlier" name="moveBackward">
                <Grid container>
                  <Grid item xs={6}>
                    <FormField
                      name="moveBackward"
                      type="number"
                      formatting="inline"
                      step="1"
                      className={classes.bulkChangeDaysInput}
                      hideArrows
                      onChange={onMoveEarlier}
                    />
                    {" "}
                    days
                  </Grid>
                  <Grid item xs={6} id="moveBackwardInfo">
                    {earlierDate && `Earliest selected session will be moved from ${earlierDate}`}
                  </Grid>
                </Grid>
              </BulkItemWrapper>
            </Grid>
          </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="p-3">
          <Button color="primary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={submitChanges}
            disabled={invalid || !dirty || Boolean(asyncValidating)}
          >
            Update
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<any>, props) => ({
  init: () => {
    dispatch(initialize(COURSE_CLASS_BULK_UPDATE_FORM, props.initialValues || initialValues));
  },
  getRooms: (search: string) => {
    dispatch(setCommonPlainSearch("Room", search));
    dispatch(getCommonPlainRecords("Room", 0, "name", true, "name"));
  }
});

const mapStateToProps = (state: State) => ({
  bulkValues: getFormValues(COURSE_CLASS_BULK_UPDATE_FORM)(state),
  rooms: state.plainSearchRecords["Room"].items,
  selection: state.courseClassesBulkSession.selection
});

const CourseClassBulkChangeSession = reduxForm({
  form: COURSE_CLASS_BULK_UPDATE_FORM,
  initialValues
})(CourseClassBulkChangeSessionForm);

export default connect<any, any, any>(mapStateToProps, mapDispatchToProps)(
  withStyles(styles)(CourseClassBulkChangeSession)
);
