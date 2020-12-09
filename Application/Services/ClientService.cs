using Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ClientService : IClientService
    {
        private readonly HttpClient _client;
       
        public ClientService(HttpClient client, IConfiguration configuration)
        {
            client.BaseAddress = new Uri(configuration["apiBaseUrl"].ToString());
            client.DefaultRequestHeaders.Add("Accept", "application/json");

            _client = client;
        }

        public async Task<List<T>> GetData<T>(string url)
        {
            var response = await _client.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                var streamTask = await response.Content.ReadAsStreamAsync();
                return await JsonSerializer.DeserializeAsync<List<T>>(streamTask);
            }
            else
            {
                return null;
            }
        }
    }
}
