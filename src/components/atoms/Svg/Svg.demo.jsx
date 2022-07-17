import React from "react";
import styled from "styled-components";

import {
  PlusIcon,
  MinusIcon,
  CompareArrowIcon,
  EditIcon,
  DeleteIcon,
  CaretDownIcon,
  CaretRightIcon,
  CaretLeftIcon,
  CaretUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  SortUpIcon,
  SortDownIcon,
  DiscordIcon,
  TelegramIcon,
  GithubIcon,
  TwitterIcon,
  InfoIcon,
  DocumentIcon,
  FAQIcon,
  RestartIcon,
  DragIcon,
  PlayIcon,
  SettingsIcon,
  CloseIcon,
  EmojiIcon,
  StarIcon,
  ActivatedStarIcon,
  LightIcon,
  DarkIcon,
  SearchIcon,
  WarningIcon,
  CalculatorIcon,
  FiatIcon,
  MenuIcon,
  CheckMarkCircleIcon,
  ExternalLinkIcon,
  SpinnerIcon,
} from "./index";

import { LoadingSpinner } from "../LoadingSpinner";

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 10%);
  grid-template-rows: repeat(4, 30px);
  grid-gap: 0px;
  align-items: center;
  justify-content: center;
  justify-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const IconDemo = () => {
  return (
    <div>
      <Row>
        <PlusIcon />
        <MinusIcon />
        <CompareArrowIcon />
        <EditIcon />
        <DeleteIcon />
        <CaretDownIcon />
        <CaretRightIcon />
        <CaretLeftIcon />
        <CaretUpIcon />
        <ArrowDownIcon />
        <ArrowRightIcon />
        <ArrowLeftIcon />
        <ArrowUpIcon />
        <SortUpIcon />
        <SortDownIcon />
        <DiscordIcon />
        <TelegramIcon />
        <GithubIcon />
        <TwitterIcon />
        <InfoIcon />
        <DocumentIcon />
        <FAQIcon />
        <RestartIcon />
        <DragIcon />
        <PlayIcon />
        <SettingsIcon />
        <CloseIcon />
        <EmojiIcon />
        <StarIcon />
        <ActivatedStarIcon />
        <LightIcon />
        <DarkIcon />
        <SearchIcon />
        <WarningIcon />
        <CalculatorIcon />
        <FiatIcon />
        <MenuIcon />
        <CheckMarkCircleIcon />
        <ExternalLinkIcon />
        <SpinnerIcon />
        <LoadingSpinner />
      </Row>
    </div>
  );
};

export default IconDemo;
