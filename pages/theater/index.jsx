import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import DevTools from "mobx-react-devtools";
import FormData from "form-data";
import _ from "lodash";
import moment from "moment";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import styled from "styled-components";

import TheaterInfo from "./TheaterInfo";
import MovieInfo from "./MovieInfo";

import { getDistance } from "../../util/getDistance";
import { lotteIcon, cgvIcon, megaboxIcon } from "../assets";

import { getTheater, getMovie, getAddress } from "../../util/api";
import { device } from "../../util/device";

/*
스타일 컴포넌트들
*/

const HeaderWrapper = styled.div`
  margin: 10px;
  width: 600px;
  text-align: center;
  @media ${device.mobileToTablet} {
    width: 100%;
  }
  margin: auto;
`;

const ContentWrapper = styled.div`
  margin: 10px;
`;

const TheaterIcon = styled.img`
  width: 100px;
  height: 50px;
  border-radius: 10px;
  border: solid 1px #384386;
  padding: 2px 10px;
  margin: 0px 10px;
  &:hover {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  }
`;

@inject("BaseStore")
@observer
class Theater extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getArea = () => {
    return new Promise(function(resolve, reject) {
      navigator.geolocation.getCurrentPosition(function(position) {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      });
    });
  };

  getTheaterInfo = async id => {
    const formData = new FormData();
    let result = {};
    let filteredCinema = [];
    if (id === "lotteCinema") {
      formData.append(
        "paramList",
        JSON.stringify({
          MethodName: "GetCinemaItems",
          channelType: "HO",
          osType: "Chrome",
          osVersion: ""
        })
      );
      result = await getTheater(formData);
      // array of object 특정 key 기준으로 중복제거
      filteredCinema = Object.values(
        result.data.Cinemas.Items.reduce(
          (acc, cur) => ({
            ...acc,
            ...{
              [cur.CinemaName]: cur
            }
          }),
          {}
        )
      );
      if (filteredCinema) {
        this.props.BaseStore.getNearCinemas(this.sortTheater(filteredCinema));
      }
    }
  };

  getMovieInfo = async theater => {
    this.props.BaseStore.setCinema(theater);
    const formData = new FormData();
    formData.append(
      "paramList",
      JSON.stringify({
        MethodName: "GetPlaySequence",
        channelType: "MW",
        osType: "",
        osVersion: "",
        playDate: `${moment().format("YYYY-MM-DD")}`,
        cinemaID: `1|1|${theater.CinemaID}`,
        representationMovieCode: ""
      })
    );
    const result = await getMovie(formData);
    const {
      data: {
        PlaySeqs: { Items }
      }
    } = result;
    this.props.BaseStore.getCinemasTime(this.sortTimeInfo(Items));
  };

  componentDidMount() {
    this.getArea()
      .then(location => this.props.BaseStore.initLocation(location))
      .then(() => this.getAddressInfo());
  }

  getAddressInfo = async () => {
    const { BaseStore } = this.props;
    const { data, initAddress } = BaseStore;
    const address = await getAddress({
      lat: data.location.latitude,
      lng: data.location.longitude
    });
    const { documents } = address;
    initAddress(documents[documents.length - 1].address_name);
  };

  componentDidUpdate(nextProps) {
    var mapOptions = {
      center: new naver.maps.LatLng(
        nextProps.BaseStore.data.location.latitude,
        nextProps.BaseStore.data.location.longitude
      ),
      zoom: 10
    };
    var map = new naver.maps.Map("map", mapOptions);
    var marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(mapOptions.center),
      map: map
    });
  }

  sortTheater = nearCinemas => {
    const { BaseStore } = this.props;
    const { data } = BaseStore;
    const { location } = data;
    nearCinemas.forEach(cinema => {
      cinema.Distance = getDistance(
        location.latitude,
        location.longitude,
        cinema.Latitude,
        cinema.Longitude,
        "K"
      );
    });
    return nearCinemas.sort((a, b) => a.Distance - b.Distance);
  };

  sortTimeInfo = movies => {
    return _.orderBy(movies, ["StartTime"], ["asc"]).filter(
      movie => movie.StartTime > moment().format("hh:mm")
    );
  };

  render() {
    const { BaseStore } = this.props;
    const { data } = BaseStore;
    const {
      theater,
      nearCinemas,
      selectedCinema,
      selectedCinemaInfo,
      address
    } = data;
    return (
      <div>
        <HeaderWrapper>
          <Card>
            <CardContent>
              <h2> Select Theater </h2>
              {theater.map(val => (
                <TheaterIcon
                  onClick={() => this.getTheaterInfo(val.id)}
                  src={
                    (val.id === "lotteCinema" && lotteIcon) ||
                    (val.id === "cgv" && cgvIcon) ||
                    (val.id === "megabox" && megaboxIcon)
                  }
                />
              ))}
            </CardContent>
          </Card>
        </HeaderWrapper>
        <ContentWrapper>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="headline" component="h2">
                Your Location
              </Typography>
              <CardActions>
                <div
                  id="map"
                  style={{
                    width: "100%",
                    height: "400px"
                  }}
                />
              </CardActions>
              <h2> 현재 위치기반 가까운 영화관 </h2>
              <h4> 현재위치: {address} </h4>
              <TheaterInfo
                nearCinemas={nearCinemas}
                getMovieInfo={this.getMovieInfo}
              />
              <MovieInfo movies={selectedCinemaInfo} />
            </CardContent>
          </Card>
        </ContentWrapper>
        <DevTools />
      </div>
    );
  }
}

export default Theater;
