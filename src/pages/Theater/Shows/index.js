import { Col, Form, Modal, Row, Table , message } from "antd";
import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import {GetAllMovies} from "../../../apicalls/movies"
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import { AddShow, DeleteShow, GetAllShowsByTheater } from "../../../apicalls/theaters";
import moment from "moment";

function Shows(props){

    const {openShowsModal, setOpenShowsModal, theater} = props
    const  [view, setView] = useState('table')
    const [shows, setShows] = useState([])
    const [movies, setMovies]=useState([])
    const dispatch = useDispatch()

    const getData= async()=>{
        try{
            dispatch(ShowLoading())
            const moviesResponse= await GetAllMovies()
            if(moviesResponse.success){
                setMovies(moviesResponse.data)
            }else{
                message.error(moviesResponse.message)
            }
            const  showsResponse = await GetAllShowsByTheater({
                theaterId: theater._id,
            })
            if(showsResponse.success){
                setShows(showsResponse.data)
            }else{
                message.error(showsResponse.message)
            }
            dispatch(HideLoading())
        }catch (error){
            message.error(error.message)
            dispatch(HideLoading())
        }
        
    }

    const handleAddShow = async (values) => {
        try {
          dispatch(ShowLoading());
          const response = await AddShow({
            ...values,
            theater: theater._id,
          });
          if (response.success) {
            message.success(response.message);
            getData();
            setView("table");
          } else {
            message.error(response.message);
          }
          dispatch(HideLoading());
        } catch (error) {
            message.error(error.message);
            dispatch(HideLoading());
    }
  };

  const handleDelete = async (id) => {
    try {
      dispatch(ShowLoading());
      const response = await DeleteShow({ showId: id });

      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  }

    const columns = [
        {
            title: "Show Name",
            dataIndex: "name"
        },
        {
            title: "Date",
            dataIndex: "date",
            render: (text, record) => {
                return moment(text).format("MMM Do YYYY")
            }
        },
        {
            title: "Time",
            dataIndex: "time"
        },
        {
            title: "Movie",
            dataIndex: "movie",
            render: (text, record) =>{
                return record.movie.title
            }
        },
        {
            title: "Ticket Price",
            dataIndex: "ticketPrice"
        },
        {
            title: "Total Seats",
            dataIndex: "totalSeats"
        },
        {
            title: "Available Seats",
            dataIndex: "availableSeats",
            render: (text, record) =>{
                return record.totalSeats - record.bookedSeats.length
            }
        },
        {
            title: "Action",
            dataIndex: "action",
            render: (text, record)=>{
                return(
                    <div className = "flex gap-1 items-center">
                        {record.bookedSeats.length === 0 && (
                            <i className="ri-delete-bin-5-fill"
                            onClick={()=>{
                                handleDelete(record._id)
                            }}
                        ></i>
                        )}

                    </div>
                )
            }
        }
    ]
      useEffect(()=>{
         getData()
      },[])
    return(
        <Modal
        title=""
        open = {openShowsModal}
        onCancel={()=>setOpenShowsModal(false)}
        width={1400}
        footer = {null}
        >
            <h1 className="text-primary text-md upper-case mb-1 ">
                Theater:{theater.name}
            </h1>
            <hr/>

            <div className="flex justify-between mt-1 mb-1 items-center">
                <h1 className="text-md uppercase">
                    {view === "table" ? "Shows" : "Add Show"}
                </h1>
                {view ==="table" && <Button
                
                variant = "outlined"
                title = "Add Show"
                onClick={()=>{
                    setView("form")
                }}
                />}
            </div>

            {view === "table" &&(
                <Table columns = {columns} dataSource={shows}/>
            )}
            {view === "form" && (
                <Form layout="vertical"
                    onFinish={handleAddShow}
                >
                    <Row
                        gutter={[16, 16]}
                        >
                        <Col span={8}>
                            <Form.Item label="Show Name" name="name"
                                rules={[{required: true, message: "Please input show name!"}]}
                            >
                                <input/>

                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Date" name="date"
                                rules={[{required: true, message: "Please input show date!"}]}
                            >
                                <input type="date"
                                    min={new Date().toISOString().split("T")[0]}
                                />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                            <Form.Item label="Time" name="time"
                                rules={[{required: true, message: "Please input show time!"}]}
                            >
                                <input type="time"/>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                            <Form.Item label="Movie" name="movie"
                                    rules={[{required: true, message: "Please select movie!"}]}
                            >
                             <select>
                                <option value="">Select Movie</option>
                                {movies.map((movie)=>(
                                  <option value={movie._id}>{movie.title}</option>
                                ))}
                             </select>
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                            <Form.Item label="Ticket Price" name="ticketPrice"
                                rules={[{required: true, message: "Please input ticket price!"}]}
                            >
                                <input type="number"/>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                            <Form.Item label="Total seats" name="totalSeats"
                                rules={[{required: true, message: "Please input total seats!"}]}
                            >
                                <input type="number"/>
                        </Form.Item>
                    </Col>
                     
                    </Row>

                    <div className="flex justify-end gap-1">
                        <Button
                        variant ="outlined"
                        title = "Cancel"
                        onClick={()=>{
                            setView("table")
                        }}
                        />
                      <Button variant = "variant" title="SAVE" type="submit"/>

                    </div>
                </Form>
            )}
        </Modal>
    )
}
export default Shows