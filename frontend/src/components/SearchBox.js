import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

export default function SearchBox() {

  const navigate = useNavigate();

  const [query, setQuery] = useState('');

  const submitHandler = (e) => {
    e.preventDefault();
    navigate(query ? `/search/?query=${query}` : '/search');
  };
  return (
    <Form className="d-flex me-auto" id="search-box-form" onSubmit={submitHandler}>
      <InputGroup>
        <Form.Control type="text" name="q" id="q" onChange={(e) => setQuery(e.target.value)} placeholder="Search Products" aria-Label="Search Products" aria-describedby="button-search" />
        <Button variant="outline-primary" type="submit" id="button-search">
          <i className="fas fa-search" />
        </Button>
      </InputGroup>
    </Form>
  )
}
