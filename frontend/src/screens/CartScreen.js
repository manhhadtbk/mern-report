import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MessageBox from '../components/MessageBox';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CartScreen() {


   let [isOutOfStock, setIsOutOfStock] = useState(false)

   const navigate = useNavigate();
   const { state, dispatch: ctxDispatch } = useContext(Store);
   const {
      cart: { cartItems }, isEnglish
   } = state;


   const updateCartHandler = async (item, quantity) => {
      const { data } = await axios.get(`/api/products/${item._id}/limit`);

      for (let i = 0; i < data.productQuantitySolds.length; i++) {
         if (data.product.name == data.productQuantitySolds[i]._id) {
            if ((data.product.countInStock - data.productQuantitySolds[i].quantity) < quantity) {
               // isOutOfStock = true
               setIsOutOfStock(true)
               return;
            } else if ((data.product.countInStock - data.productQuantitySolds[i].quantity) > quantity) {
               setIsOutOfStock(false)
            }
         }
      }

      // if (/* data.countInStock < quantity */ isOutOfStock) {
      //    window.alert('Sorry. Product is out of stock');
      //    return;
      // }

      ctxDispatch({
         type: 'CART_ADD_ITEM',
         payload: { ...item, quantity },
      });
   };

   const removeItemHandler = (item) => {
      ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
   };

   const checkoutHandler = () => {
      navigate('/signin?redirect=/shipping');
   };

   return (
      <div>
         <Helmet>
            <title>
               {isEnglish ? 'Shopping Cart' : 'Giỏ hàng'}
            </title>
         </Helmet>
         <h1> {isEnglish ? 'Shopping Cart' : 'Giỏ hàng'}</h1>
         <Row>
            <Col md={8}>
               {cartItems.length === 0 ? (
                  <MessageBox>
                     {isEnglish ? 'Cart is empty' : 'Giỏ hàng trống'}
                     <Link to="/">
                        {isEnglish ? 'Go Shopping' : 'Tới trang sản phẩm'}
                     </Link>
                  </MessageBox>
               ) : (
                  <ListGroup>
                     {cartItems.map((item) => (
                        <ListGroup.Item key={item._id}>
                           <Row className="align-items-center">
                              <Col md={4}>
                                 <img
                                    src={item.image}
                                    alt={item.name}
                                    className="img-fluid rounded img-thumbnail"
                                 ></img>{' '}
                                 <Link to={`/product/${item.slug}`}>{item.name}</Link>
                              </Col>
                              <Col md={3}>
                                 <Button
                                    onClick={() =>
                                       updateCartHandler(item, item.quantity - 1)
                                    }
                                    variant="light"
                                    disabled={item.quantity === 1}
                                 >
                                    <i className="fas fa-minus-circle"></i>
                                 </Button>{' '}
                                 <span>{item.quantity}</span>{' '}
                                 <Button
                                    variant="light"
                                    onClick={() =>
                                       updateCartHandler(item, item.quantity + 1)
                                    }
                                    disabled={isOutOfStock || item.quantity === item.countInStock}
                                 >
                                    <i className="fas fa-plus-circle"></i>
                                 </Button>
                              </Col>
                              <Col md={3}>${item.price}</Col>
                              <Col md={2}>
                                 <Button
                                    onClick={() => removeItemHandler(item)}
                                    variant="light"
                                 >
                                    <i className="fas fa-trash"></i>
                                 </Button>
                              </Col>
                           </Row>
                        </ListGroup.Item>
                     ))}
                  </ListGroup>
               )}
            </Col>
            <Col md={4}>
               <Card>
                  <Card.Body>
                     <ListGroup variant="flush">
                        <ListGroup.Item>
                           <h3>
                              {isEnglish ? 'Subtotal' : 'Tổng tiền'}

                              ({cartItems.reduce((a, c) => a + c.quantity, 0)}{' '}
                              {isEnglish ? 'items' : 'sản phẩm'}

                              ) : $
                              {cartItems.reduce((a, c) => a + c.price * c.quantity, 0)}
                           </h3>
                        </ListGroup.Item>
                        <ListGroup.Item>
                           <div className="d-grid">
                              <Button
                                 type="button"
                                 variant="primary"
                                 onClick={checkoutHandler}
                                 disabled={cartItems.length === 0}
                              >
                                 {isEnglish ? 'Proceed to Checkout' : 'Tiến hành thanh toán'}
                              </Button>
                           </div>
                        </ListGroup.Item>
                     </ListGroup>
                  </Card.Body>
               </Card>
            </Col>
         </Row>
      </div>
   );
}
