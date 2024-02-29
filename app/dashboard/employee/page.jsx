"use client";
import React, { useContext, useEffect } from "react";
import { AuthContext } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function Employee() {
  const { currentUser } = useContext(AuthContext);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }
  }, []);

  return (
    <>
      <div className="grid mt-2 grid-cols-[1fr_min-content]">
        <div></div>
        <div className="grid grid-cols-[min-content_min-content_min-content]">
          <Button className="mx-1">Filter</Button>
          <Button className="mx-1">New</Button>
          <Button className="mx-1" variant="outline">
            <RotateCcw />
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <Table>
          <TableCaption>Nothing to Show / Page 1 of 100</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20ch]">ID</TableHead>
              <TableHead className="">Name</TableHead>
              <TableHead className="w-[10ch]">Sex</TableHead>
              <TableHead className="w-[10ch]">Birthyear</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">3CdLQuqOTQvZhehgCRHf</TableCell>
              <TableCell>Jerome Evangelista</TableCell>
              <TableCell className="">Male</TableCell>
              <TableCell className="">2001</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default Employee;
