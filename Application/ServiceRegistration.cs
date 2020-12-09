using Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Application.Services;
using System;
using Microsoft.Extensions.Configuration;

namespace Application
{
    public static class ServiceRegistration
    {

        public static void AddApplicationLayer(this IServiceCollection services)
        {
            //services.AddHttpClient("JobAdder", c =>
            //{
            //    c.BaseAddress = new Uri("http://private-76432-jobadder1.apiary-mock.com");
            //    // Github API versioning
            //    c.DefaultRequestHeaders.Add("Accept", "application/json");
            //});

            services.AddHttpClient<ClientService>();
        }
    }
}