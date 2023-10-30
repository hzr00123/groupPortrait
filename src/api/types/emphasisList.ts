export interface tantNameListPrams {
	focusGroup?: string,
	importantNameListType?: string,
	orgDataInfoEntity: {
		campusId?: number,
		classId?: number,
		collegeId?: number,
		gradeId?: number,
		majorId?: number
	}
	pageNum: number,
	pageSize: number,
	sex?: string,
	searchKey?: string,
	warningName?: string
}

export interface orgTypePrams {
	campusId?: number,
	classId?: number,
	collegeId?: number,
	gradeId?: number,
	majorId?: number
}

export interface removeNamePrams {
	id: number
}