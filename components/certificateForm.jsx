'use client'
import React from "react";
import { nationalities, baranggays } from "@/config/local";

function addToDatabase(e) {
  e.preventDefault()
}

function DateInput() {
  let currentDate = new Date()
  let day = currentDate.getDate();
  let month = currentDate.getMonth() + 1;
  let year = currentDate.getFullYear();

  let today = year + '-' + month + '-' + day
  console.log(today);
  return <input defaultValue={today} type="date" className="border" />
}

export function CertificateForm() {
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
