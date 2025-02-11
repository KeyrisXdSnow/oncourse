/*
 * Copyright ish group pty ltd. All rights reserved. https://www.ish.com.au
 * No copying or use of this code is allowed without permission in writing from ish.
 */

import * as React from "react";
import { FormControlLabel } from "@mui/material";
import { initialize, reduxForm } from "redux-form";
import { connect } from "react-redux";
import FormField from "../../../../../../common/components/form/formFields/FormField";
import RouteChangeConfirm from "../../../../../../common/components/dialog/confirm/RouteChangeConfirm";
import { onSubmitFail } from "../../../../../../common/utils/highlightFormClassErrors";

class SurveyGizmoBaseForm extends React.Component<any, any> {
  constructor(props) {
    super(props);

    // Initializing form with values
    props.dispatch(initialize("SurveyGizmoForm", props.item));
  }

  componentDidUpdate(prevProps) {
    if (prevProps.item.id !== this.props.item.id) {
      // Reinitializing form with values
      this.props.dispatch(initialize("SurveyGizmoForm", this.props.item));
    }
  }

  render() {
    const {
     AppBarContent, handleSubmit, onSubmit, dirty, form
    } = this.props;

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        {dirty && <RouteChangeConfirm form={form} when={dirty} />}

        <AppBarContent>
          <FormField name="fields.user" label="User" type="text" className="mb-2" />
          <FormField name="fields.password" label="Password" type="password" className="mb-2" />
          <FormField name="fields.surveyId" label="Survey ID" type="text" className="mb-2" />
          <FormField
            name="fields.courseTag"
            label="Only activate for enrolments in courses tagged with"
            type="text"
            className="mb-2"
          />

          <div className="flex-column pt-2">
            <FormControlLabel
              control={<FormField name="fields.sendOnEnrolmentSuccess" color="primary" type="checkbox" />}
              label="Send on successful enrolment"
            />
            <FormControlLabel
              control={<FormField name="fields.sendOnEnrolmentCompletion" color="primary" type="checkbox" />}
              label="Send on completion"
            />
          </div>
        </AppBarContent>
      </form>
    );
  }
}

export const AlchemerForm = reduxForm({
  form: "SurveyGizmoForm",
  onSubmitFail
})(connect<any, any, any>(null, null)(SurveyGizmoBaseForm));
