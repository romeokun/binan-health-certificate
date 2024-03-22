"use client";
import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "@/components/auth-provider";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";

// todo: for admin, manage users such as add and change role
// 3 role: admin, normal, disabled
// admin must not able to change another admin
function Manage() {
  const { currentUser } = useContext(AuthContext);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }
  }, []);

  const [table, setTable] = useState([]);
  const [tableQuerying, setTableQuerying] = useState(false);
  const endOfQuery = useRef(false);

  const handleLoadMore = () => {};

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Time</TableHead>
            <TableHead className="w-[150px]">User</TableHead>
            <TableHead className="w-[150px]">Target</TableHead>
            <TableHead className="">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.map((element) => {
            <TableRow key={element.id}>
              <TableCell>test</TableCell>
              <TableCell>test</TableCell>
              <TableCell>test</TableCell>
              <TableCell>test</TableCell>
            </TableRow>;
          })}
        </TableBody>
      </Table>
      <div className="grid place-items-center mt-2">
        {tableQuerying ? (
          "loading"
        ) : (
          <Button
            onClick={handleLoadMore}
            disabled={tableQuerying || endOfQuery.current}
            variant="outline"
          >
            Load More
          </Button>
        )}
      </div>
    </>
  );
}

export default Manage;
