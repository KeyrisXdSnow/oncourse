/*
 * Copyright ish group pty ltd 2021.
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
 *
 *  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 */

import * as React from "react";
import { connect } from "react-redux";
import { change } from "redux-form";
import { Grid, IconButton } from "@mui/material";
import Launch from "@mui/icons-material/Launch";
import FormField from "../../../../common/components/form/formFields/FormField";
import { State } from "../../../../reducers/state";
import CustomFields from "../../customFieldTypes/components/CustomFieldsTypes";
import ContactSelectItemRenderer from "../../contacts/components/ContactSelectItemRenderer";
import CourseItemRenderer from "../../courses/components/CourseItemRenderer";
import { courseFilterCondition, openCourseLink } from "../../courses/utils";
import { LinkAdornment } from "../../../../common/components/form/FieldAdornments";
import { contactLabelCondition, defaultContactName, openContactLink } from "../../contacts/utils";
import FullScreenStickyHeader
  from "../../../../common/components/list-view/components/full-screen-edit-view/FullScreenStickyHeader";

class WaitingListGeneral extends React.PureComponent<any, any> {
  handlerCourseChange = courseId => {
    const { coursesItems, dispatch, form } = this.props;
    const course = coursesItems.find(c => c.id === courseId);

    if (course) dispatch(change(form, "courseName", `${course.name} ${course.code}`));
  };

  render() {
    const {
      values,
      tags,
      form,
      twoColumn,
      isNew,
      syncErrors
    } = this.props;

    const gridItemProps: any = {
      xs: twoColumn ? 6 : 12
    };

    return (
      <Grid container columnSpacing={3} rowSpacing={2} className="p-3">
        <Grid item xs={12}>
          <FullScreenStickyHeader
            opened={isNew || Object.keys(syncErrors).includes("contactId")}
            disableInteraction={!isNew}
            twoColumn={twoColumn}
            title={(
              <div className="d-inline-flex-center">
                {values && defaultContactName(values.studentName)}
                <IconButton disabled={!values?.contactId} size="small" color="primary" onClick={() => openContactLink(values?.contactId)}>
                  <Launch fontSize="inherit" />
                </IconButton>
              </div>
            )}
            fields={(
              <Grid item {...gridItemProps}>
                <FormField
                  type="remoteDataSearchSelect"
                  entity="Contact"
                  aqlFilter="isStudent is true"
                  name="contactId"
                  label="Student"
                  selectValueMark="id"
                  selectLabelCondition={contactLabelCondition}
                  defaultDisplayValue={values && defaultContactName(values.studentName)}
                  labelAdornment={
                    <LinkAdornment linkHandler={openContactLink} link={values.contactId} disabled={!values.contactId} />
                  }
                  itemRenderer={ContactSelectItemRenderer}
                  rowHeight={55}
                  required
                />
              </Grid>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <FormField
            type="tags"
            name="tags"
            tags={tags}
          />
        </Grid>
        <Grid item xs={12}>
          <FormField type="number" name="studentCount" label="Number of students" />
        </Grid>
        <Grid item xs={12}>
          <FormField
            type="remoteDataSearchSelect"
            entity="Course"
            aqlFilter="allowWaitingLists is true"
            name="courseId"
            label="Course"
            selectValueMark="id"
            selectLabelCondition={v => v.name}
            selectFilterCondition={courseFilterCondition}
            defaultDisplayValue={values && values.courseName}
            labelAdornment={<LinkAdornment link={values.courseId} linkHandler={openCourseLink} />}
            itemRenderer={CourseItemRenderer}
            onChange={this.handlerCourseChange}
            rowHeight={55}
            required
          />
        </Grid>
        <CustomFields
          entityName="WaitingList"
          fieldName="customFields"
          entityValues={values}
          form={form}
          gridItemProps={gridItemProps}
        />
      </Grid>
    );
  }
}

const mapStateToProps = (state: State) => ({
  tags: state.tags.entityTags["WaitingList"],
  coursesItems: state.plainSearchRecords["Course"]?.items,
});

export default connect<any, any, any>(mapStateToProps)(WaitingListGeneral);
