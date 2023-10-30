export interface ChartData {
  campusId: string,
  collegeId: string,
  majorId: string,
  gradeId: string,
  classId: string,
  schoolYear: string,
  semester: string,
  sex: string,
  nation: string,
  studentType: string,
  placeOrigin: string,
  politics: string,
  enrollType: string,
  userGroupType: string,
  userGroupDescription: string,
  startTime: string,
  endTime: string,
  ident?:Ref<string> | string,
  category?: Ref<string> | string,
  poorLevel?: Ref<string> | string,
  expExcel?:boolean
  typeName?:Ref<string> | string,
  campus?:Ref<string> | string,
  id?: string|number,
  consTime?: Ref<string> | string,
  poorStatus?: Ref<string> | string,
}