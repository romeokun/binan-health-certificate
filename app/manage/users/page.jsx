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
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  where,
  addDoc,
  Timestamp,
  serverTimestamp,
  limit,
  startAfter,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@/config/firebase";
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
import { Pencil, Save } from "lucide-react";

// todo: for admin, manage users such as add and change role
// 3 role: admin, normal, disabled
// admin must not able to change another admin

const PAGELIMIT = 25;

function handleQuery(array = []) {
  // return array.filter(x => x !== null)
  const x = array.filter((x) => x);
  return x;
}
async function loadQuery({ collectionID, order, conditions = [], loadAfter }) {
  const q = query(
    collection(db, collectionID),
    ...handleQuery([order, ...conditions, loadAfter]),
    limit(PAGELIMIT)
  );

  return getDocs(q);
}

function Manage() {
  const { currentUser, isLoading } = useContext(AuthContext);
  const [table, setTable] = useState([]);
  const [error, setError] = useState({ isError: false, message: "" });
  const [tableQuerying, setTableQuerying] = useState(false);
  const router = useRouter();
  const nextPageToken = useRef(null);
  const [userNames, setUserNames] = useState({});
  const namesQuery = useRef([]);
  const [showNewDialog, setShowNewDialog] = useState(false);

  const [status, setStatus] = useState("loading");

  const initialize = () => {
    setStatus("loading");
    setTable([]);
    namesQuery.current = [];
    auth.currentUser
      .getIdToken(true)
      .then(function (idToken) {
        return fetch("/api/get-users", {
          method: "POST",
          body: JSON.stringify({ token: idToken }),
        });
      })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setTable(res.users);
        setStatus("ok");
        nextPageToken.current = res.nextPageToken;
      });
  };

  const runOnce = useRef(true);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    } else {
      if (runOnce) {
        initialize();
        runOnce.current = false;
      }
    }
  }, []);

  const handleLoadMore = () => {
    auth.currentUser
      .getIdToken(true)
      .then(function (idToken) {
        return fetch("/api/get-users", {
          method: "POST",
          body: JSON.stringify({
            token: idToken,
            nextPageToken: nextPageToken.current,
          }),
        });
      })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setTable((prev) => [...prev, res.users]);
        nextPageToken.current = res.nextPageToken;
      });
  };

  return (
    <>
      <div className="grid grid-cols-[1fr_min-content_min-content]">
        <div></div>
        <Button
          className="mx-1"
          onClick={() => {
            // setShowFilter(!showFilter);
          }}
        >
          Filter
        </Button>
        <Button
          className="mx-1"
          onClick={() => {
            setShowNewDialog(true);
          }}
        >
          New
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Created</TableHead>
            <TableHead className="w-[250px]">User UID</TableHead>
            <TableHead className="">Name</TableHead>
            <TableHead className="w-[100px]">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.map((element) => {
            if (!namesQuery.current.includes(element.uid)) {
              namesQuery.current.push(element.uid);
              getDoc(doc(db, "users", element.uid)).then((res) => {
                setUserNames((prev) => ({
                  ...prev,
                  [element.uid]: res.data(),
                }));
              });
            }
            return (
              <TableRow
                key={element.uid}
                onClick={() => {
                  router.push("/manage/users?id=" + element.uid);
                }}
                className="hover:cursor-pointer"
              >
                <TableCell>{element.created}</TableCell>
                <TableCell>{element.uid}</TableCell>
                <TableCell>{userNames[element.uid]?.name}</TableCell>
                <TableCell>{userNames[element.uid]?.role}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="grid place-items-center mt-2">
        {status == "loading" && <>Loading</>}
        {status == "ok" && (
          <Button
            onClick={handleLoadMore}
            disabled={tableQuerying || !nextPageToken.current}
            variant="outline"
          >
            Load More
          </Button>
        )}
      </div>
      <NewDialog
        open={showNewDialog}
        set={setShowNewDialog}
        reload={initialize}
      ></NewDialog>
      <View refresh={initialize} />
    </>
  );
}

const NewDialog = ({ children, set, reload, ...props }) => {
  const { currentUser } = useContext(AuthContext);
  const [data, setData] = useState({
    email: "",
    name: "",
    password: "",
    role: "default",
  });
  const [message, setMessage] = useState("");

  const router = useRouter();
  const handleOnOpenChange = (open) => {
    set(open);
    if (!open) {
      setData({
        email: "",
        name: "",
        password: "",
        role: "default",
      });
      setMessage("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (data.name != "" && data.email != "" && data.password.length >= 6) {
      e.target.disabled = true;
      try {
        auth.currentUser
          .getIdToken(true)
          .then(function (idToken) {
            return fetch("/api/create-user", {
              method: "POST",
              body: JSON.stringify({
                token: idToken,
                email: data.email,
                name: data.name,
                role: data.role,
                password: data.password,
              }),
            });
          })
          .then(async (res) => {
            const data = await res.json();
            return { status: res.status, ...data };
          })
          .then((res) => {
            console.log(res);
            if (res.status == 200) {
              set(false);
              reload();
              setMessage("");
              router.push("/manage/users?id=" + res.uid);
            } else {
              setMessage(res.error.message);
              e.target.disabled = false;
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.error(error);
        e.target.disabled = true;
      }
    } else {
      setMessage("Missing Parameter or Password is not 6 character long");
    }
  };

  return (
    <Dialog onOpenChange={handleOnOpenChange} {...props}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New User</DialogTitle>
        </DialogHeader>
        <form className="mt-4 grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Email</Label>
            <Input
              required
              className="col-span-3 disabled:cursor-default disabled:opacity-100"
              type="text"
              value={data.email}
              onChange={(e) => {
                setData({ ...data, email: e.target.value });
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Name</Label>
            <Input
              required
              className="col-span-3 disabled:cursor-default disabled:opacity-100"
              type="text"
              value={data.name}
              onChange={(e) => {
                setData({ ...data, name: e.target.value });
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Password</Label>
            <Input
              required
              className="col-span-3 disabled:cursor-default disabled:opacity-100"
              type="password"
              value={data.password}
              onChange={(e) => {
                setData({ ...data, password: e.target.value });
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Role</Label>
            <select
              name=""
              id=""
              value={data.role}
              onChange={(e) => {
                setData({ ...data, role: e.target.value });
              }}
            >
              <option value="default">Default</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="text-red-500">{message}</div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Button
              className="col-start-4"
              type="submit"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const View = ({ children, set, reloadCertificate, refresh, ...props }) => {
  // use employee object to display

  const { currentUser } = useContext(AuthContext);
  const search = useSearchParams();
  const [isEdit, setIsEdit] = useState(false);
  const router = useRouter();
  const [data, setData] = useState({
    email: "",
    displayName: "",
    password: "",
    role: "default",
  });
  const currentInfo = useRef(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editPass, setEditPass] = useState(false);

  const [status, setStatus] = useState("loading");
  useEffect(() => {
    if (search.has("id")) {
      setShowDialog(true);
      setStatus("loading");

      auth.currentUser
        .getIdToken(true)
        .then(function (idToken) {
          return fetch("/api/get-user", {
            method: "POST",
            body: JSON.stringify({ token: idToken, id: search.get("id") }),
          });
        })
        .then((res) => {
          if (res.status == 200) {
            return res.json();
          } else {
            throw new Error("Not found");
          }
        })
        .then((res) => {
          currentInfo.current = res.user;
          setData({ ...data, ...res.user });
        })
        .then((res) => {
          return getDoc(doc(db, "users", search.get("id")));
        })
        .then((res) => {
          setData((prev) => ({ ...prev, role: res.data().role }));
          setStatus("ok");
        })
        .catch((error) => {
          setStatus("error");
          console.error(error);
        });
    } else {
      setShowDialog(false);
      setStatus("loading");
    }
  }, [search]);

  const handleEdit = () => {
    setIsEdit(true);
  };
  const handleCancel = () => {
    setData({ password: "", ...currentInfo.current });
    setIsEdit(false);
    setEditPass(false);
  };
  const handleOnOpenChange = (open) => {
    setShowDialog(open);
    setStatus("loading");
    if (!open) {
      handleCancel();
      setData({
        email: "",
        name: "",
        password: "",
        role: "default",
      });
      router.push("/manage/users");
    }
  };

  const handleSave = (e) => {
    if (!isEdit) return;
    if (!editPass) {
      auth.currentUser
        .getIdToken(true)
        .then(function (idToken) {
          return fetch("/api/update-user", {
            method: "POST",
            body: JSON.stringify({
              token: idToken,
              id: search.get("id"),
              name: data.displayName,
              role: data.role,
            }),
          });
        })
        .then(() => {
          refresh();
          setIsEdit(false);
        });
    } else {
      if (data.password.length >= 6)
        auth.currentUser
          .getIdToken(true)
          .then(function (idToken) {
            return fetch("/api/setpass-user", {
              method: "POST",
              body: JSON.stringify({
                token: idToken,
                id: search.get("id"),
                password: data.password,
              }),
            });
          })
          .then(() => {
            setIsEdit(false);
            setEditPass(false);
          });
    }
  };

  const handleDelete = async (e) => {
    auth.currentUser
      .getIdToken(true)
      .then(function (idToken) {
        return fetch("/api/delete-user", {
          method: "POST",
          body: JSON.stringify({
            token: idToken,
            id: search.get("id"),
          }),
        });
      })
      .then(() => {
        refresh();
        router.push("/manage/users");
      });
  };

  return (
    <Dialog onOpenChange={handleOnOpenChange} open={showDialog} {...props}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className=" bg-slate-100 grid-rows-[min-content_1fr_min-content]">
        <DialogHeader>
          <DialogTitle>User</DialogTitle>
        </DialogHeader>
        <div className="p-4 place-content-center overflow-auto">
          <div className="m-auto">
            {status == "ok" &&
              (editPass ? (
                <div>
                  <div className="grid grid-cols-[min-content_1fr] gap-2 items-center my-2">
                    <span className="text-right">New&nbsp;Password</span>
                    <input
                      type="text"
                      className="rounded p-2 border border-slate-400"
                      disabled={!isEdit}
                      value={data.password}
                      onChange={(e) => {
                        setData({ ...data, password: e.target.value });
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-4 gap-2 items-center my-2">
                    <span className="text-right">Email</span>
                    <input
                      type="text"
                      className="col-span-3 rounded p-2 border border-slate-400"
                      disabled={true}
                      value={data.email}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center my-2">
                    <span className="text-right">Name</span>
                    <input
                      type="text"
                      className="col-span-3 rounded p-2 border border-slate-400"
                      disabled={!isEdit}
                      value={data.displayName}
                      onChange={(e) => {
                        setData({ ...data, displayName: e.target.value });
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center my-2">
                    <span className="text-right">Role</span>
                    <select
                      className="p-2"
                      disabled={!isEdit}
                      value={data.role}
                      onChange={(e) => {
                        setData({ ...data, role: e.target.value });
                      }}
                    >
                      <option value="default">Default</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            {status == "loading" && <>Loading</>}
            {status == "error" && <>User Not Found</>}
          </div>
        </div>
        <div className="grid gap-4 grid-cols-[1fr_min-content] mt-4">
          {status == "ok" && isEdit && (
            <div className="col-start-2 flex flex-row gap-2">
              <Button onClick={handleCancel} type="">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-green-400 hover:bg-green-700"
              >
                Save
              </Button>
            </div>
          )}
          {status == "ok" && !isEdit && (
            <div className="col-start-2 flex flex-row gap-2">
              <Dialog>
                <DialogTrigger
                  className={buttonVariants({ variant: "destructive" })}
                >
                  Delete
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete
                      the user account.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                onClick={() => {
                  handleEdit();
                  setEditPass(!editPass);
                }}
                type=""
              >
                New Password
              </Button>
              <Button onClick={handleEdit} type="">
                Edit
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Manage;
