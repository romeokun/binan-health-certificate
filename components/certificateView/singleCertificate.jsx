import React from 'react'

// possible data
// created: serverTimestamp(),
// No: no,
// OrNo: orNo,
// DateIssued: Timestamp.fromDate(dateissued),
// Name: namePerson,
// Occupation: occupation,
// Age: age,
// Sex: sex,
// Nationality: nationality,
// PlaceOfWork: placeOfWork,


export function SingleCertificate({ certificate }) {
  const { created, No, OrNo, DateIssued, Name, Occupation, Age, Sex, Nationality, PlaceOfWork} = certificate || {}
  return (
    // <div>created No OrNo DateIssued Name Occupation Age Sex Nationality PlaceofWork</div>
    <div>
      {/* <span className="mx-4">{created}</span> */}
      <span className="mx-4">{No}</span>
      <span className="mx-4">{OrNo}</span>
      {/* <span className="mx-4">{DateIssued}</span> */}
      <span className="mx-4">{Name}</span>
      <span className="mx-4">{Occupation}</span>
      <span className="mx-4">{Age}</span>
      <span className="mx-4">{Sex}</span>
      <span className="mx-4">{Nationality}</span>
      <span className="mx-4">{PlaceOfWork}</span>
    </div>
  )
}