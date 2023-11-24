'use client'
import React, { useState } from "react";
import { nationalities, baranggays } from "@/config/local";
import { collection, addDoc, Timestamp, serverTimestamp } from "firebase/firestore"; 
import { db } from "@/config/firebase";

export function CertificateForm() {
  let currentDate = new Date()
  let day = currentDate.getDate();
  let month = currentDate.getMonth() + 1;
  let year = currentDate.getFullYear();
  let today = year + '-' + month + '-' + day


  const [no, setNo] = useState(0)
  const [orNo, setOrNo] = useState(0)
  const [dateIssued, setdateIssued] = useState(today)
  const [namePerson, setNamePerson] = useState('')
  const [occupation, setOccupation] = useState('')
  const [age, setAge] = useState(0)
  const [sex, setSex] = useState('male')
  const [nationality, setNationality] = useState('Filipino')
  const [placeOfWork, setPlaceOfWork] = useState('Biñan')
  

  function DateInput() {
    

    return <input onChange= {(e) => {
      setdateIssued(e.target.value)
    }} defaultValue={today} type="date" className="border" />
  }
  
  async function addToDatabase(e) {
    e.preventDefault()

    let dateissued = new Date(dateIssued + "T00:00+08:00")
    if( no >= 0 && orNo >= 0 && age >= 0 && 
        namePerson.trim() != '' && occupation.trim() != ''
    ) {

      await addDoc(collection(db, 'certificates'), {
        created: serverTimestamp(),
        No: no,
        OrNo: orNo,
        DateIssued: Timestamp.fromDate(dateissued),
        Name: namePerson,
        Occupation: occupation,
        Age: age,
        Sex: sex,
        Nationality: nationality,
        PlaceOfWork: placeOfWork,
      })

      // todo: success modal
      alert('success')
      console.log('success'); // temp
    } else {
      // todo: fail
      alert('fail')
      console.log('fail'); // temp
    }

  }

  return (
    <div>
      <form>
        <div>
          no.
          <input onChange={ e => {setNo(e.target.value)}} type="number" className="border" defaultValue='0'/>
        </div>
        <div>
          OR no.
          <input onChange={e => {setOrNo(e.target.value)}} type="number" className="border" defaultValue='0'/>
        </div>
        <div>
          Date Issued
          {DateInput()}
        </div>
        <div>
          Name
          <input onChange={e => {setNamePerson(e.target.value)}} type="text" className="border" />
        </div>
        <div>
          Occupation
          <input onChange={e => {setOccupation(e.target.value)}} type="text" className="border" />
        </div>
        <div>
          Age
          <input onChange={e => {setAge(e.target.value)}} type="number" className="border" defaultValue='0'/>
        </div>
        <div>
          Sex
          <select onChange={e => {setSex(e.target.value)}} name="" id="">
           <option key='1' value="male">Male</option>
           <option key='2' value="female">Female</option>
          </select>
        </div>
        <div>
          Nationality
          <select onChange={(e) => {
            setNationality(e.target.value)
          }} name="" id="" defaultValue={'Filipino'}>
           {nationalities.map( (x, index) => {
            return <option  key={index} value={x}>{x}</option>
           })}
          </select>
        </div>
        <div>
          Place of Work
          <select onChange={ e => { setPlaceOfWork(e.target.value)}} name="" id="">
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
