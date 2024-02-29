"use client";
import React, { useContext, useEffect } from "react";
import { AuthContext } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { RotateCcw, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
              <TableHead className="w-[200px]">Recent Certificate</TableHead>
              <TableHead className="">Name</TableHead>
              <TableHead className="w-[10ch]">Sex</TableHead>
              <TableHead className="w-[10ch]">Birthyear</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                3CdLQuqOTQvZhehgCRHf
              </TableCell>
              <TableCell>Jerome Evangelista</TableCell>
              <TableCell className="">Male</TableCell>
              <TableCell className="">2001</TableCell>
              <TableCell className="grid place-items-center">
                <View>
                  <MoreHorizontal />
                </View>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  );
}

const View = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Employee Profile</DialogTitle>
        </DialogHeader>
        <div className="mt-4 grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Employee ID</Label>
            <Input
              className="col-span-3"
              disabled
              type="text"
              defaultValue="ABCDEFGHIJK"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Name</Label>
            <Input
              className="col-span-3"
              disabled
              type="text"
              defaultValue="Jerome Evangelista"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Sex</Label>
            <SelectOption
              disabled
              data={[
                { value: "male", text: "Male" },
                { value: "female", text: "Female" },
              ]}
              defaultValue="male"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Birthyear</Label>
            <Input
              disabled
              type="text"
              pattern="[0-9]+"
              className="col-span-3"
              defaultValue="2001"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Recent Certificate</Label>
            <Button className="col-span-3" variant="outline">
              0987654321
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button type="">Cancel</Button>
          <Button type="">Edit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SelectOption = ({ title, data, className, ...props }) => {
  return (
    <Select {...props}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={title} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {data?.map((x) => {
          return (
            <SelectItem key={x.value} value={x.value}>
              {" "}
              {x.text}{" "}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default Employee;
