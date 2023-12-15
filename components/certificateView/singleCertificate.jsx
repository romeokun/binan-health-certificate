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

// TODO:
// delete, view, print 
// inside view -> edit



export function SingleCertificate({ certificate, viewForm, set }) {
  const { created, No, OrNo, DateIssued, Name, Occupation, Age, Sex, Nationality, PlaceOfWork} = certificate.data() || {}


  function view() {
    viewForm()
    set(certificate)
  }

  return (
    // <div>created No OrNo DateIssued Name Occupation Age Sex Nationality PlaceofWork</div>
    <div className='bg-white rounded-full h-[32px] flex hover:scale-[100.5%] hover:bg-[rgb(188,188,188)] hover:shadow cursor-pointer overflow-x-auto overflow-y-hidden '>
      {/* <span className="mx-4">{created}</span> */}
      <span className="mx-4 w-[9ch] whitespace-nowrap truncate flex-none text-center ">{No}</span>
      <span className="mx-4 w-[9ch] whitespace-nowrap truncate flex-none text-center ">{OrNo}</span>
      {/* <span className="mx-4">{DateIssued}</span> */}
      <span className="mx-4 w-[24ch] whitespace-nowrap truncate flex-none text-center ">{Name}</span>
      <span className="mx-4 w-[16ch] whitespace-nowrap truncate flex-none text-center ">{Occupation}</span>
      <span className="mx-4 w-[4ch] whitespace-nowrap truncate flex-none text-center ">{Age}</span>
      <span className="mx-4 w-[6ch] whitespace-nowrap truncate flex-none text-center ">{Sex}</span>
      <span className="mx-4 w-[8ch] whitespace-nowrap truncate flex-none text-center ">{Nationality}</span>
      <span className="mx-4 w-[16ch] whitespace-nowrap truncate flex-none text-center ">{PlaceOfWork}</span>

      <div onClick={view} className='px-[8px] hover:bg-red-600'>view</div>
      <div className='px-[8px] hover:bg-red-600'>delete</div>
    </div>
  )
}