'use client'
import React, { useState } from "react";
import { nationalities, baranggays } from "@/config/local";
import { collection, addDoc, Timestamp } from "firebase/firestore"; 
import { db } from "@/config/firebase";

export function CertificateForm() {
  const [ dateIssued, setdateIssued] = useState('')

  function DateInput() {
    let currentDate = new Date()
    let day = currentDate.getDate();
    let month = currentDate.getMonth() + 1;
    let year = currentDate.getFullYear();
  
    let today = year + '-' + month + '-' + day
    return <input onChange= {(e) => {
      setdateIssued(e.target.value)
    }} defaultValue={today} type="date" className="border" />
  }
  
  async function addToDatabase(e) {
    e.preventDefault()

    let dateissued = new Date(dateIssued + "T00:00+08:00")

    await addDoc(collection(db, 'certificates'), {
      No: '12345',
      OrNo: '12345',
      DateIssued: Timestamp.fromDate(dateissued),
    })
  }

  return (
    <div>
      <form>
        <div>
          no.
          <input type="text" className="border" />
        </div>
        <div>
          OR no.
          <input type="text" className="border" />
        </div>
        <div>
          Date Issued
          {DateInput()}
        </div>
        <div>
          Name
          <input type="text" className="border" />
        </div>
        <div>
          Occupation
          <input type="text" className="border" />
        </div>
        <div>
          Age
          <input type="number" className="border" />
        </div>
        <div>
          Sex
          <select name="" id="">
           <option key='1' value="male">Male</option>
           <option key='2' value="female">Female</option>
          </select>
        </div>
        <div>
          Nationality
          <select name="" id="" defaultValue={'Filipino'}>
           {nationalities.map( (x, index) => {
            return <option  key={index} value={x}>{x}</option>
           })}
          </select>
        </div>
        <div>
          Place of Work
          <select name="" id="">
          {baranggays.map( (x, index) => {
            return <option key={index} value={x}>{x}</option>
           })}
          </select>
        </div>
        <div>
          <button type="submit" className="border" onClick={addToDatabase}>submit</button>
        </div>
      </form>
    </div>
  );
}
