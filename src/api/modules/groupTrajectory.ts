import request from "@/service";


export function getGroupTraceDatas(data: any) {
    return request({
        url: '/behaviorTrace/getGroupTraceDatas',
        data
    })
}

export function getNoGroupTraceDatas(data: any) {
  return request({
      url: '/behaviorTrace/getNoGroupTraceDatas',
      data
  })
}

export function exportNoGroupTraceDatas(data: any) {
  return request({
      url: '/behaviorTrace/exportNoGroupTraceDatas',
      responseType: 'blob',
      data
  })
}

export function leaveSchoolMap(data: any) {
  return request({
      url: '/behaviorTrace/leaveSchoolMap',
      data
  })
}

export function leaveSchoolDestination(data: any) {
  return request({
      url: '/behaviorTrace/leaveSchoolDestination',
      data
  })
}

export function leaveSchoolList(data: any) {
  return request({
      url: '/behaviorTrace/leaveSchoolList',
      data
  })
}

export function getPersonalTraceDatas(data: any) {
  return request({
      url: '/behaviorTrace/getPersonalTraceDatas',
      data
  })
}
