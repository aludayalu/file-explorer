import Head from "next/head";
import { Text, Link, Navbar, Spacer, Divider, Button, Input, Card, Row, Modal} from "@nextui-org/react";
import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react";
import { get } from "../request"
import { CiFileOn, CiFolderOn } from "react-icons/ci";

const FileUploadComponent = (password, path, refresh) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [base64String, setBase64String] = useState('');
    if (password==="") {
        return ""
    }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(";base64,")[1];
        setBase64String(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    // Use base64String for your upload logic
    if (selectedFile) {
      console.log('Base64 String:', base64String);
      get("/upload", {"password":password, "data":base64String, "name":selectedFile.name, "path":path}).then((x)=>{
        refresh(true)
        document.getElementById("file").value=""
      })
    } else {
      console.error('No file selected');
    }
  };

  return (
    <div className="wrapper">
      <input type="file"  id="file" onChange={handleFileChange} />
      <Button onClick={handleUpload}>Upload</Button>
    </div>
  );
};

export default function Home() {
    const [password, setPassword]=useState("")
    const [directory_listing, setDirectoryListing]=useState({"path":"", "directory":[]})
    const [path, setPath]=useState("")
    const [current_opened, setCurrentOpened]=useState({"type":"", "name":""})
    const [refresh_path, setRefreshPath]=useState(false)
    useEffect(()=>{
        get("/", {"path":path, "password":password}).then((x)=>{
            if (path=="" && x.data.path!==undefined) {
                setPath(x.data.path)
            }
            setDirectoryListing(x.data)
        })
        setRefreshPath(false)
    }, [password, refresh_path, path])
    var x=FileUploadComponent(password, path, setRefreshPath)
    if (password=="" || directory_listing.directory?.length===0 || directory_listing.directory===undefined) {
        return (
            <>
            <div className="wrapper" style={{height:"100vh", width:"100vw"}}>
                <div>
                <div className="wrapper">
                <Input bordered placeholder="Password" id="auth"></Input>
                </div>
                <Spacer></Spacer>
                <div className="wrapper">
                <Button onClick={()=>{
                    setPassword(document.getElementById("auth").value)
                }}>Login</Button>
                </div>
                </div>
            </div>
            </>
        )
    }
    {x}
    return (
        <>
            <Head>
                <title></title>
            </Head>

            <Navbar isBordered isCompact variant="sticky" css={{bgBlur: "#000000"}}>
                <Navbar.Brand>
                    <Text h3 css={{textGradient: "45deg, $white -20%, $green600 50%"}}>~ aludayalu</Text>
                </Navbar.Brand>
            </Navbar>
            <Spacer></Spacer>
            <h4 className="vertical">Current Directory {(new URL(directory_listing.path, 'http://example.com')).pathname}</h4>
            {x}
            <Spacer></Spacer>
            {directory_listing.directory?.map((x)=>{
                return (
                    <>
                    <div className="wrapper">
                    <Card css={{p:"$5", maxW:"80%"}} isPressable onClick={()=>{
                        setCurrentOpened({"type":x.type, "name":x.name})
                    }}>
                        <Row>
                        <a style={{height:"20px", width:"20px"}} className="wrapper">
                        {x.type=="file" ? <CiFileOn size={"28px"}/> : <CiFolderOn size={"28px"}/>}
                        </a>
                        <Spacer x={.25}></Spacer>
                        {x.name}
                        </Row>
                    </Card>
                    </div>
                    <Spacer y={0.5}></Spacer>
                    </>
                )
            })}
            <Modal
            open={current_opened.name!==""}
            onClose={()=>{
                setCurrentOpened({"type":"", "name":""})
            }}
            >
                <Modal.Header><Text h2>{current_opened.type} Details</Text></Modal.Header>
                <Modal.Body>
                    <div className="wrapper">
                        <Text h4>{current_opened.name}</Text>
                    </div>
                    {current_opened.type=="folder" ? 
                        <Button
                        onClick={()=>{
                            setPath(path+"/"+current_opened.name)
                            setCurrentOpened({"type":"", "name":""})
                            setRefreshPath(true)
                        }}
                        >Go to Directory</Button>
                    : <Button color={"gradient"} onClick={()=>{
                        get("/download", {"password":password, "name":path+"/"+current_opened.name}).then((x)=>{
                            const byteCharacters = atob(x.data);
                        const byteNumbers = new Array(byteCharacters.length);
                  
                        for (let i = 0; i < byteCharacters.length; i++) {
                          byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                  
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: 'application/octet-stream' });
                  
                        // Save the blob as a file
                        saveAs(blob, current_opened.name);
                        })
                    }}>Download</Button>}
                    
                    <Button color={"error"} onClick={()=>{
                        get("/delete", {"path":path+"/"+current_opened.name, "password":password}).then((x)=>{
                            setCurrentOpened({"type":"", "name":""})
                            setRefreshPath(true)
                        })
                    }}>Delete {current_opened.type}</Button>
                </Modal.Body>
            </Modal>
        </> 
    )
}