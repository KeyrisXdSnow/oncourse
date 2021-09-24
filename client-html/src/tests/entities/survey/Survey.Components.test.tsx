import SurveyEditView from "../../../js/containers/entities/survey/components/SurveyEditView";
import { mockedEditView } from "../../common/MockedEditView.Components";

describe("Virtual rendered SurveyEditView", () => {
  mockedEditView({
    entity: "Survey",
    EditView: SurveyEditView,
    record: mockecApi => mockecApi.db.getSurvey(1),
    render: (wrapper, initialValues) => {
      expect(wrapper.find(".textField").text()).toContain(initialValues.studentName);
      expect(wrapper.find("#EditListItemForm-netPromoterScore-1").text()).toContain("");
      expect(wrapper.find("#EditListItemForm-netPromoterScore-2").text()).toContain("");
      expect(wrapper.find("#comment input").val()).toContain(initialValues.comment);
      expect(wrapper.find("#visibility input").val()).toContain(initialValues.visibility);
      expect(wrapper.find("#testimonial input").val()).toContain("No value");
    }
  });
});
