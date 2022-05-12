import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { Container, LoadingOverlay, SegmentedControl } from '@mantine/core';
import { useEffect } from 'react';
import { rpc, gql } from '../lib/smartgraph/gql';
import { plainToInstance, plainToClass, classToPlain, instanceToPlain, plainToClassFromExist } from 'class-transformer';
import { UniswapRouterEntity } from '../store/entity';
import MainLayout from '../components/Layout/index';
import { Prism } from '@mantine/prism';
import { PromiseState } from '@/store/standard/PromiseState';

const demoCode = `

// smartgraph.ts
import { SmartGraph } from '@smartgraph/core';
export const smartGraph = new SmartGraph({
  plugins: [plugins.NetworkPlugin(), plugins.ERC20Extension(), plugins.LpTokenExtension(), UniswapPlugin()]
});
...

//page.ts
import {rpc} from "@/src/lib/smartgraph/gql"

const data = await rpc('query')({
  UniswapRouter: [ { calls: [{ address: '0x95cB18889B968AbABb9104f30aF5b310bD007Fd8', chainId: 4689 }] }, {
      swap: [{args: {sellToken: 'BUSD_b',buyToken: '0xb8744ae4032be5e5ef9fab94ee9c3bf38d5d2ae0', buyAmount: 100000000000000,recipient: '0x2AcB8663B18d8c8180783C18b88D60b86de26dF2'}}, {
          amount: true,
          data: true,
          router: true,
          path: {
            address: true,
            symbol: true,
            decimals: true,
            totalSupply: true
          }
        }
      ]
    }
  ]
});
return plainToInstance(UniswapRouter, data.UniswapRouter[0]);

`;

export const Home = observer(() => {
  const store = useLocalObservable(() => ({
    testQuery: new PromiseState({
      function: async ({ buyAmount = `${1000000000000000000 * Math.random()}` }: { buyAmount?: string } = {}) => {
        const data = await rpc('query')({
          UniswapRouter: [
            { calls: [{ address: '0x95cB18889B968AbABb9104f30aF5b310bD007Fd8', chainId: 4689 }] },
            {
              swap: [
                {
                  args: {
                    sellToken: 'BUSD_b',
                    buyToken: '0xb8744ae4032be5e5ef9fab94ee9c3bf38d5d2ae0',
                    buyAmount,
                    recipient: '0x2AcB8663B18d8c8180783C18b88D60b86de26dF2',
                    offlinePrice: true
                  }
                },
                {
                  amount: true,
                  data: true,
                  router: true,
                  path: {
                    address: true,
                    symbol: true,
                    decimals: true,
                    totalSupply: true
                  }
                }
              ]
            }
          ]
        });
        if (store.testQuery.value) {
          return plainToClassFromExist(store.testQuery.value, data.UniswapRouter[0]);
        }

        const instance = plainToInstance(UniswapRouterEntity, data.UniswapRouter[0]);
        return instanceToPlain(instance);
      }
    })
  }));
  useEffect(() => {
    store.testQuery.call();
  }, []);
  return (
    <MainLayout>
      <Prism language="tsx">{demoCode}</Prism>
      <pre style={{ position: 'relative', minHeight: '200px' }}>
        <LoadingOverlay visible={store.testQuery.loading.value} />
        <Prism language="json">{JSON.stringify(store.testQuery.value, null, 2)}</Prism>
      </pre>
    </MainLayout>
  );
});

export default Home;
