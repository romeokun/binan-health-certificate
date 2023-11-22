import React from "react";
import { nationalities, baranggays } from "@/config/local";


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
          <input type="text" className="border" />
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
          <select name="" id="">
           {nationalities.map( (x, index) => {
            return <option key={index} value={x}>{x}</option>
           })}
          </select>
        </div>
        <div>
          Place of Work
          <select name="" id="">
          {baranggays.map( (x, index) => {
            let isSelected = false
            if(x == 'Filipino') isSelected = true
            return <option selected={isSelected} key={index} value={x}>{x}</option>
           })}
          </select>
        </div>
        <div>
          <button type="submit"></button>
        </div>
      </form>
    </div>
  );
}
