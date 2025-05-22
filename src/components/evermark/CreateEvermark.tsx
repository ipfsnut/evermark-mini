import React, { useState, useRef } from "react";
import { useWallet } from "../../hooks/useWallet";
import { useEvermarkCreation, type EvermarkMetadata } from "../../hooks/useEvermarkCreation";
import { 
  PlusIcon, 
  LinkIcon, 
  AlertCircleIcon, 
  CheckCircleIcon,
  UploadIcon,
  ImageIcon,
  XIcon,
  LoaderIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import PageContainer from '../layout/PageContainer';
import { MetadataForm, type EnhancedMetadata } from './MetadataForm';