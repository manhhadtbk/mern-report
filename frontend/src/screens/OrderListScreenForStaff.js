import axios from 'axios'
import React, { useContext } from 'react'
import { useEffect } from 'react'
import { useReducer } from 'react'
import Button from 'react-bootstrap/Button'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { Store } from '../Store'
import { getError } from '../utils'

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        orders: action.payload,
        loading: false,
      }
    case 'FETCH_FAIL':
      return {
        ...state, loading: false, error: action.payload
      }
  }
}

export default function OrderScreenListForStaff() {
  const navigate = useNavigate()
  const { state } = useContext(Store)
  const { userInfo, isEnglish } = state

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' })
        const { data } = await axios.get(`/api/orders/staff`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        })
        console.log({ data });
        dispatch({ type: 'FETCH_SUCCESS', payload: data })
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err)
        })
      }
    }
    fetchData()
  }, [userInfo])

  return (
    <div>
      <Helmet>
        <title>
          {isEnglish ? 'Orders' : 'Các đơn hàng'}
        </title>
      </Helmet>
      <h1> {isEnglish ? 'Orders' : 'Các đơn hàng'}</h1>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger" >{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>
                ID</th>
              <th>
                {isEnglish ? 'USER' : 'Người dùng'}

              </th>
              <th>
                {isEnglish ? 'DATE' : 'Thời gian'}
              </th>
              <th>
                {isEnglish ? 'TOTAL' : 'Tổng số tiền'}
              </th>
              <th>
                {isEnglish ? 'PAID' : 'Tình trạng thanh toán'}
              </th>
              <th>
                {isEnglish ? 'CANCELED' : 'Tình trạng hủy'}
              </th>
              <th>
                {isEnglish ? 'DELIVERED' : 'Tình trạng giao hàng'}
              </th>
              <th>
                {isEnglish ? 'ACTIONS' : 'Hành động'}
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user ? order.user.name : '' /* 'DELETED USER' */}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>{order.totalPrice.toFixed(2)}</td>
                {order.isPaid ?
                  <td
                    style={{ background: '#d8f0e1' }}
                  > {order.paidAt ? order.paidAt.substring(0, 10) : 'unknow date'} </td>
                  :
                  <td
                    style={{ background: '#fde5dd' }}
                  >{'No'}</td>
                }
                <td>{order.canceled ? 'Canceled' : 'No'}</td>
                <td>{order.isDelivered ? order.deliveredAt.substring(0, 10) : 'No'}</td>
                <td>
                  <Button
                    type="button"
                    variant="light"
                    onClick={
                      () => {
                        navigate(`/order/${order._id}`)
                      }
                    }
                  >
                    {isEnglish ? 'Details' : 'Xem chi tiết'}

                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
      }



    </div>
  )
}
