"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Key, Check, AlertCircle, ExternalLink } from 'lucide-react';

interface APIKeys {
  openai?: string;
  anthropic?: string;
  google?: string;
}

interface APIKeyManagerProps {
  onKeysUpdate: (keys: APIKeys) => void;
  currentKeys: APIKeys;
}

export function APIKeyManager({ onKeysUpdate, currentKeys }: APIKeyManagerProps) {
  const [keys, setKeys] = useState<APIKeys>(currentKeys);
  const [isOpen, setIsOpen] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setKeys(currentKeys);
  }, [currentKeys]);

  const handleKeyChange = (provider: keyof APIKeys, value: string) => {
    const updatedKeys = { ...keys, [provider]: value };
    setKeys(updatedKeys);
  };

  const handleSave = () => {
    onKeysUpdate(keys);
    setIsOpen(false);
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const isKeyConfigured = (key?: string) => key && key.length > 10;

  const getProviderStatus = (provider: keyof APIKeys): 'configured' | 'missing' => {
    return isKeyConfigured(keys[provider]) ? 'configured' : 'missing';
  };

  const maskKey = (key?: string) => {
    if (!key) return '';
    if (key.length <= 8) return key;
    return `${key.substring(0, 8)}${'•'.repeat(Math.min(key.length - 8, 20))}`;
  };

  const getProviderInfo = (provider: keyof APIKeys) => {
    const info = {
      openai: {
        name: 'OpenAI',
        description: 'GPT-4o for general conversation and business advice',
        website: 'https://platform.openai.com/api-keys',
        placeholder: 'sk-...',
        instructions: 'Go to OpenAI Platform → API Keys → Create new secret key'
      },
      anthropic: {
        name: 'Anthropic',
        description: 'Claude for complex business analysis and reasoning',
        website: 'https://console.anthropic.com/settings/keys',
        placeholder: 'sk-ant-...',
        instructions: 'Go to Anthropic Console → Settings → API Keys → Create Key'
      },
      google: {
        name: 'Google AI',
        description: 'Gemini for market research and data analysis',
        website: 'https://aistudio.google.com/app/apikey',
        placeholder: 'AIza...',
        instructions: 'Go to Google AI Studio → Get API Key → Create API Key'
      }
    };

    return info[provider];
  };

  const configuredCount = Object.values(keys).filter(key => isKeyConfigured(key)).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>AI Settings</span>
          {configuredCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {configuredCount}/3 configured
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>AI Provider Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Provider Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(Object.keys(keys) as Array<keyof APIKeys>).map(provider => {
                  const status = getProviderStatus(provider);
                  const info = getProviderInfo(provider);
                  
                  return (
                    <div key={provider} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{info.name}</div>
                        <div className="text-sm text-gray-500">
                          {status === 'configured' ? 'Connected' : 'Not configured'}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {status === 'configured' ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Configuration Tabs */}
          <Tabs defaultValue="openai">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
              <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
              <TabsTrigger value="google">Google AI</TabsTrigger>
            </TabsList>

            {(Object.keys(keys) as Array<keyof APIKeys>).map(provider => {
              const info = getProviderInfo(provider);
              const isConfigured = getProviderStatus(provider) === 'configured';
              
              return (
                <TabsContent key={provider} value={provider} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span>{info.name}</span>
                            {isConfigured && <Check className="w-4 h-4 text-green-500" />}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor={`${provider}-key`}>API Key</Label>
                        <div className="flex space-x-2 mt-1">
                          <Input
                            id={`${provider}-key`}
                            type={showKeys[provider] ? 'text' : 'password'}
                            value={keys[provider] || ''}
                            onChange={(e) => handleKeyChange(provider, e.target.value)}
                            placeholder={info.placeholder}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => toggleKeyVisibility(provider)}
                          >
                            {showKeys[provider] ? 'Hide' : 'Show'}
                          </Button>
                        </div>
                        {isConfigured && !showKeys[provider] && (
                          <p className="text-xs text-gray-500 mt-1">
                            Current: {maskKey(keys[provider])}
                          </p>
                        )}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">How to get your API key:</h4>
                        <p className="text-sm text-blue-800 mb-3">{info.instructions}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(info.website, '_blank')}
                          className="flex items-center space-x-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Get API Key</span>
                        </Button>
                      </div>

                      {provider === 'openai' && (
                        <div className="bg-amber-50 p-4 rounded-lg">
                          <h4 className="font-medium text-amber-900 mb-2">💡 Recommendation</h4>
                          <p className="text-sm text-amber-800">
                            OpenAI provides the best general conversation experience and is recommended as your primary AI provider.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>

          {/* Important Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Your API keys are stored locally in your browser and never sent to our servers</p>
              <p>• You are responsible for any API usage costs with the providers</p>
              <p>• We recommend starting with OpenAI for the best experience</p>
              <p>• You can configure multiple providers and switch between them</p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}